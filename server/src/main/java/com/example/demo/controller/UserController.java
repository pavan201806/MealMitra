package com.example.demo.controller;

import com.example.demo.model.Users;
import com.example.demo.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ---------------- REGISTER ----------------
    @PostMapping("/register")
    public String register(@RequestBody Users user) {

        userService.register(user);
        return "User registered successfully";
    }

    // ---------------- LOGIN ----------------
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Users loginData) {

        Users user = userService.login(
                loginData.getEmail(),
                loginData.getPassword()
        );

        // ✅ RESPONSE FOR FRONTEND
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole()); // USER / ADMIN

        return response;
    }
}
