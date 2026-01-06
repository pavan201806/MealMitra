package com.mealmitra.server.service;

import com.mealmitra.server.dto.AuthDTO;
import com.mealmitra.server.model.User;
import com.mealmitra.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonationService donationService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public Map<String, Object> getAllUsers() {
        List<User> users = userRepository.findAll();

        List<AuthDTO.UserResponse> userResponses = users.stream()
                .map(user -> AuthDTO.UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .phone(user.getPhone())
                        .address(user.getAddress())
                        .latitude(user.getLatitude())
                        .longitude(user.getLongitude())
                        .city(user.getCity())
                        .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_FORMATTER) : null)
                        .build())
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("users", userResponses);
        return response;
    }

    public Map<String, Object> getAllDonations() {
        return donationService.getAllDonations();
    }
}
