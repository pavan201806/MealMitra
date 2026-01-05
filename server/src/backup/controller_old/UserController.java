package com.example.demo.controller;


import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Users;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;

import jakarta.servlet.http.HttpSession;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    HttpSession session;

    @Autowired
    UserRepository ur;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Users u) {
        String result = userService.registerUser(u);
        if (result.equals("email already existed")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Users u) {
    
    Users existuser = ur.findByEmail(u.getEmail());
    if (existuser != null && existuser.getPassword().equals(u.getPassword())) {
        session.setAttribute("loggedInUser", existuser.getId());
        

        // Build a response map with message and role
        Map<String, Object> response = new HashMap<>();
        response.put("message", "login successful");
        response.put("role", existuser.getRole());

        return ResponseEntity.ok(response);
    }

    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("invalid credentials");
}

}




