package com.example.demo.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Users;
import com.example.demo.repository.UserRepository;

import jakarta.servlet.http.HttpSession;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HttpSession session;

    public String registerUser(Users u) {
        System.out.println(u.getRole());
        Users existingUser = userRepository.findByEmail(u.getEmail());
        if (existingUser != null) {
            return "email already existed";
        }
        userRepository.save(u);
        return "registration done successfully";
    }

    public Map<String, String> loginUser(Users u) {
        Users existingUser = userRepository.findByEmail(u.getEmail());
        Map<String, String> response = new HashMap<>();
        if (existingUser != null && existingUser.getPassword().equals(u.getPassword())) {
            session.setAttribute("loggedInUser", existingUser.getId());
            response.put("role", existingUser.getRole());
            response.put("email", existingUser.getEmail());
            return response;
        }
        response.put("error", "invalid username or password");
        return response;
    }
}
