package com.mealmitra.server.controller;

import com.mealmitra.server.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/volunteers")
    public ResponseEntity<Map<String, Object>> getVolunteers() {
        Map<String, Object> response = userService.getVolunteers();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ngos")
    public ResponseEntity<Map<String, Object>> getNGOs() {
        Map<String, Object> response = userService.getNGOs();
        return ResponseEntity.ok(response);
    }
}
