package com.mealmitra.server.controller;

import com.mealmitra.server.exception.ForbiddenException;
import com.mealmitra.server.model.Role;
import com.mealmitra.server.security.UserPrincipal;
import com.mealmitra.server.service.DonationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ngo")
public class NGOController {

    @Autowired
    private DonationService donationService;

    @GetMapping("/nearby-donations")
    public ResponseEntity<Map<String, Object>> getNearbyDonations(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "") String address) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (userPrincipal.getRole() != Role.NGO) {
            throw new ForbiddenException("Forbidden: Insufficient permissions");
        }

        Map<String, Object> response = donationService.getNearbyDonations(address);
        return ResponseEntity.ok(response);
    }
}
