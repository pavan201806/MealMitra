package com.mealmitra.server.controller;

import com.mealmitra.server.exception.ForbiddenException;
import com.mealmitra.server.model.Role;
import com.mealmitra.server.security.UserPrincipal;
import com.mealmitra.server.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (userPrincipal.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Forbidden: Insufficient permissions");
        }

        Map<String, Object> response = adminService.getAllUsers();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/donations")
    public ResponseEntity<Map<String, Object>> getAllDonations(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (userPrincipal.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Forbidden: Insufficient permissions");
        }

        Map<String, Object> response = adminService.getAllDonations();
        return ResponseEntity.ok(response);
    }
}
