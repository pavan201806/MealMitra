package com.mealmitra.server.service;

import com.mealmitra.server.dto.DonationDTO;
import com.mealmitra.server.exception.BadRequestException;
import com.mealmitra.server.model.Donation;
import com.mealmitra.server.model.DonationStatus;
import com.mealmitra.server.model.User;
import com.mealmitra.server.repository.DonationRepository;
import com.mealmitra.server.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DonationService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AIServiceClient aiServiceClient;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Transactional
    public Map<String, Object> createDonation(Long donorId, DonationDTO.CreateDonationRequest request) {
        // Validate required fields
        if (request.getFood_name() == null || request.getFood_name().isBlank() ||
                request.getFood_type() == null || request.getFood_type().isBlank() ||
                request.getQuantity() == null || request.getQuantity().isBlank() ||
                request.getPickup_address() == null || request.getPickup_address().isBlank() ||
                request.getExpiry_time() == null || request.getExpiry_time().isBlank() ||
                request.getImage_url() == null || request.getImage_url().isBlank()) {
            throw new BadRequestException("Missing required fields. Image URL is required for AI validation.");
        }

        // Validate image URL format
        if (!request.getImage_url().startsWith("http://") && !request.getImage_url().startsWith("https://")) {
            throw new BadRequestException("Image URL must start with http:// or https://");
        }

        // Prepare donation data for AI service
        Map<String, Object> donationDataForAI = new HashMap<>();
        donationDataForAI.put("donor_id", donorId);
        donationDataForAI.put("food_name", request.getFood_name());
        donationDataForAI.put("food_type", request.getFood_type());
        donationDataForAI.put("quantity", request.getQuantity());
        donationDataForAI.put("pickup_address", request.getPickup_address());
        donationDataForAI.put("expiry_time", request.getExpiry_time());
        donationDataForAI.put("image_url", request.getImage_url());

        // Call AI orchestration service
        Map<String, Object> aiResult = aiServiceClient.orchestrateDonation(donationDataForAI);

        // Check if food was rejected by AI
        Boolean rejected = (Boolean) aiResult.get("rejected");
        if (rejected != null && rejected) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("rejected", true);
            response.put("message", "Donation rejected by AI safety validation");

            Map<String, Object> summary = (Map<String, Object>) aiResult.get("summary");
            if (summary != null) {
                response.put("reason", summary.get("reason"));
                response.put("confidence", summary.get("confidence"));
            }
            response.put("ai_result", aiResult);
            return response;
        }

        // Check if AI service returned an error
        Boolean error = (Boolean) aiResult.get("error");
        Boolean success = (Boolean) aiResult.get("success");
        if ((error != null && error) || (success != null && !success)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", true);
            response.put("message", "AI service error during donation processing");
            response.put("ai_result", aiResult);
            return response;
        }

        // AI validation passed - create donation in database
        Map<String, Object> summary = (Map<String, Object>) aiResult.get("summary");
        Long volunteerId = summary != null ? getLongValue(summary.get("volunteer_id")) : null;

        Donation donation = Donation.builder()
                .donorId(donorId)
                .foodName(request.getFood_name())
                .foodType(request.getFood_type())
                .quantity(request.getQuantity())
                .pickupAddress(request.getPickup_address())
                .expiryTime(request.getExpiry_time())
                .volunteerId(volunteerId)
                .status(volunteerId != null ? DonationStatus.ASSIGNED : DonationStatus.PENDING)
                .build();

        donation = donationRepository.save(donation);

        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("rejected", false);
        response.put("message", "Donation created successfully and assigned by AI");
        response.put("donation", toDonationResponse(donation));

        Map<String, Object> aiResultSummary = new HashMap<>();
        if (summary != null) {
            aiResultSummary.put("ticket_id", summary.get("ticket_id"));
            aiResultSummary.put("volunteer_id", summary.get("volunteer_id"));
            aiResultSummary.put("ngo_id", summary.get("ngo_id"));
            aiResultSummary.put("priority_score", summary.get("priority_score"));
        }

        Map<String, Object> results = (Map<String, Object>) aiResult.get("results");
        if (results != null) {
            aiResultSummary.put("rewards", results.get("rewards"));
        }

        response.put("ai_result", aiResultSummary);
        return response;
    }

    public Map<String, Object> getDonorDonations(Long donorId) {
        List<Donation> donations = donationRepository.findByDonorIdOrderByCreatedAtDesc(donorId);

        Map<String, Object> response = new HashMap<>();
        response.put("donations", donations.stream()
                .map(this::toDonationResponse)
                .collect(Collectors.toList()));
        return response;
    }

    public Map<String, Object> getAvailableDonations() {
        List<Donation> donations = donationRepository.findByStatusOrderByCreatedAtDesc(DonationStatus.PENDING);

        // Enrich with donor information
        List<DonationDTO.DonationResponse> enrichedDonations = donations.stream()
                .map(this::enrichWithDonorInfo)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("donations", enrichedDonations);
        return response;
    }

    public Map<String, Object> getVolunteerDonations(Long volunteerId) {
        List<DonationStatus> statuses = Arrays.asList(DonationStatus.ASSIGNED, DonationStatus.DELIVERED);
        List<Donation> donations = donationRepository.findByVolunteerIdAndStatusInOrderByCreatedAtDesc(volunteerId,
                statuses);

        // Enrich with donor information
        List<DonationDTO.DonationResponse> enrichedDonations = donations.stream()
                .map(this::enrichWithDonorInfo)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("donations", enrichedDonations);
        return response;
    }

    @Transactional
    public Map<String, Object> assignDonation(Long donationId, Long volunteerId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new BadRequestException("Donation not found"));

        if (donation.getStatus() != DonationStatus.PENDING) {
            throw new BadRequestException("Donation not available or already assigned");
        }

        donation.setStatus(DonationStatus.ASSIGNED);
        donation.setVolunteerId(volunteerId);
        donationRepository.save(donation);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Donation assigned successfully");
        return response;
    }

    @Transactional
    public Map<String, Object> completeDonation(Long donationId, Long volunteerId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new BadRequestException("Donation not found"));

        if (!volunteerId.equals(donation.getVolunteerId()) || donation.getStatus() != DonationStatus.ASSIGNED) {
            throw new BadRequestException("Donation not found or not assigned to you");
        }

        donation.setStatus(DonationStatus.DELIVERED);
        donationRepository.save(donation);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Donation completed successfully");
        return response;
    }

    public Map<String, Object> getNearbyDonations(String address) {
        // Simple implementation - return delivered donations
        List<Donation> donations = donationRepository.findByStatusOrderByCreatedAtDesc(DonationStatus.DELIVERED);

        // Enrich with donor information
        List<DonationDTO.DonationResponse> enrichedDonations = donations.stream()
                .map(this::enrichWithDonorInfo)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("donations", enrichedDonations);
        return response;
    }

    public Map<String, Object> getAllDonations() {
        List<Donation> donations = donationRepository.findAllOrderByCreatedAtDesc();

        // Enrich with donor and volunteer information
        List<DonationDTO.DonationResponse> enrichedDonations = donations.stream()
                .map(this::enrichWithDonorAndVolunteerInfo)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("donations", enrichedDonations);
        return response;
    }

    private DonationDTO.DonationResponse toDonationResponse(Donation donation) {
        return DonationDTO.DonationResponse.builder()
                .id(donation.getId())
                .donor_id(donation.getDonorId())
                .food_name(donation.getFoodName())
                .food_type(donation.getFoodType())
                .quantity(donation.getQuantity())
                .pickup_address(donation.getPickupAddress())
                .expiry_time(donation.getExpiryTime())
                .status(donation.getStatus())
                .volunteer_id(donation.getVolunteerId())
                .created_at(donation.getCreatedAt() != null ? donation.getCreatedAt().format(DATE_FORMATTER) : null)
                .build();
    }

    private DonationDTO.DonationResponse enrichWithDonorInfo(Donation donation) {
        DonationDTO.DonationResponse response = toDonationResponse(donation);

        userRepository.findById(donation.getDonorId()).ifPresent(donor -> {
            response.setDonor_name(donor.getName());
            response.setDonor_phone(donor.getPhone());
        });

        return response;
    }

    private DonationDTO.DonationResponse enrichWithDonorAndVolunteerInfo(Donation donation) {
        DonationDTO.DonationResponse response = toDonationResponse(donation);

        userRepository.findById(donation.getDonorId()).ifPresent(donor -> {
            response.setDonor_name(donor.getName());
            response.setDonor_email(donor.getEmail());
        });

        if (donation.getVolunteerId() != null) {
            userRepository.findById(donation.getVolunteerId()).ifPresent(volunteer -> {
                response.setVolunteer_name(volunteer.getName());
                response.setVolunteer_email(volunteer.getEmail());
            });
        }

        return response;
    }

    private Long getLongValue(Object value) {
        if (value == null)
            return null;
        if (value instanceof Long)
            return (Long) value;
        if (value instanceof Integer)
            return ((Integer) value).longValue();
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
