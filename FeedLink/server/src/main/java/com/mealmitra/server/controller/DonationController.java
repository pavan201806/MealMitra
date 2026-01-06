package com.mealmitra.server.controller;

import com.mealmitra.server.dto.DonationDTO;
import com.mealmitra.server.exception.ForbiddenException;
import com.mealmitra.server.model.Role;
import com.mealmitra.server.security.UserPrincipal;
import com.mealmitra.server.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    @Autowired
    private DonationService donationService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createDonation(
            Authentication authentication,
            @Valid @RequestBody DonationDTO.CreateDonationRequest request) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (userPrincipal.getRole() != Role.DONOR) {
            throw new ForbiddenException("Forbidden: Insufficient permissions");
        }

        Map<String, Object> response = donationService.createDonation(userPrincipal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/donor")
    public ResponseEntity<Map<String, Object>> getDonorDonations(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (userPrincipal.getRole() != Role.DONOR) {
            throw new ForbiddenException("Forbidden: Insufficient permissions");
        }

        Map<String, Object> response = donationService.getDonorDonations(userPrincipal.getUserId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available")
    public ResponseEntity<Map<String, Object>> getAvailableDonations(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (userPrincipal.getRole() != Role.VOLUNTEER) {
            throw new ForbiddenException("Forbidden: Insufficient permissions");
        }

        Map<String, Object> response = donationService.getAvailableDonations();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/volunteer")
    public ResponseEntity<Map<String, Object>> getVolunteerDonations(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (userPrincipal.getRole() != Role.VOLUNTEER) {
            throw new ForbiddenException("Forbidden: Insufficient permissions");
        }

        Map<String, Object> response = donationService.getVolunteerDonations(userPrincipal.getUserId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assign")
    public ResponseEntity<Map<String, Object>> assignDonation(
            Authentication authentication,
            @Valid @RequestBody DonationDTO.AssignDonationRequest request) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (userPrincipal.getRole() != Role.VOLUNTEER) {
            throw new ForbiddenException("Forbidden: Insufficient permissions");
        }

        Map<String, Object> response = donationService.assignDonation(request.getDonation_id(),
                userPrincipal.getUserId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete")
    public ResponseEntity<Map<String, Object>> completeDonation(
            Authentication authentication,
            @Valid @RequestBody DonationDTO.CompleteDonationRequest request) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (userPrincipal.getRole() != Role.VOLUNTEER) {
            throw new ForbiddenException("Forbidden: Insufficient permissions");
        }

        Map<String, Object> response = donationService.completeDonation(request.getDonation_id(),
                userPrincipal.getUserId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllDonations(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (userPrincipal.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Forbidden: Insufficient permissions");
        }

        Map<String, Object> response = donationService.getAllDonations();
        return ResponseEntity.ok(response);
    }
}
