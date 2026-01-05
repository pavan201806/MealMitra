package com.example.demo.service;

import com.example.demo.model.Users;
import com.example.demo.repository.UsersRepository;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UsersRepository usersRepository;

    public UserServiceImpl(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    // ---------------- REGISTER ----------------
    @Override
    public Users register(Users user) {

        usersRepository.findByEmail(user.getEmail())
                .ifPresent(u -> {
                    throw new RuntimeException("Email already registered");
                });

        // default role safety
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }

        return usersRepository.save(user);
    }

    // ---------------- LOGIN ----------------
    @Override
    public Users login(String email, String password) {

        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email"));

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }
}
