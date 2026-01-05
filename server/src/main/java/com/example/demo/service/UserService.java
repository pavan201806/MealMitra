package com.example.demo.service;

import com.example.demo.model.Users;

public interface UserService {

    Users register(Users user);

    Users login(String email, String password);
}
