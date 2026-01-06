package com.mealmitra.server.service;

import com.mealmitra.server.dto.AuthDTO;
import com.mealmitra.server.exception.BadRequestException;
import com.mealmitra.server.exception.NotFoundException;
import com.mealmitra.server.exception.UnauthorizedException;
import com.mealmitra.server.model.Role;
import com.mealmitra.server.model.User;
import com.mealmitra.server.repository.UserRepository;
import com.mealmitra.server.security.JwtTokenProvider;
import com.mealmitra.server.service.LocationNormalizerService.LocationData;
import com.mealmitra.server.service.LocationNormalizerService.LocationInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private LocationNormalizerService locationNormalizer;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        // Validate required fields
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Missing required fields");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Missing required fields");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Missing required fields");
        }
        if (request.getRole() == null) {
            throw new BadRequestException("Missing required fields");
        }

        // Normalize and validate location
        LocationInput locationInput = new LocationInput(
                request.getLatitude(),
                request.getLongitude(),
                request.getCity());

        LocationData normalizedLocation;
        try {
            normalizedLocation = locationNormalizer.normalizeLocation(locationInput);
            locationNormalizer.validateLocation(normalizedLocation);
        } catch (BadRequestException e) {
            throw new BadRequestException("Location error: " + e.getMessage());
        }

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already registered");
        }

        // Create user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone())
                .address(request.getAddress())
                .latitude(normalizedLocation.getLatitude())
                .longitude(normalizedLocation.getLongitude())
                .city(normalizedLocation.getCity())
                .build();

        user = userRepository.save(user);

        // Generate token
        String token = jwtTokenProvider.generateToken(user);

        // Build response
        AuthDTO.UserResponse userResponse = AuthDTO.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();

        return AuthDTO.AuthResponse.builder()
                .message("User registered successfully")
                .token(token)
                .user(userResponse)
                .build();
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        // Validate required fields
        if (request.getEmail() == null || request.getEmail().isBlank() ||
                request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Email and password required");
        }

        // Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // Generate token
        String token = jwtTokenProvider.generateToken(user);

        // Build response
        AuthDTO.UserResponse userResponse = AuthDTO.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();

        return AuthDTO.AuthResponse.builder()
                .message("Login successful")
                .token(token)
                .user(userResponse)
                .build();
    }

    public AuthDTO.UserResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return AuthDTO.UserResponse.builder()
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
                .build();
    }

    @Transactional
    public AuthDTO.UserResponse updateProfile(Long userId, AuthDTO.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Update basic fields
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        // Update location if provided
        if (request.getLatitude() != null || request.getLongitude() != null || request.getCity() != null) {
            LocationInput locationInput = new LocationInput(
                    request.getLatitude(),
                    request.getLongitude(),
                    request.getCity());

            LocationData normalizedLocation;
            try {
                normalizedLocation = locationNormalizer.normalizeLocation(locationInput);
                locationNormalizer.validateLocation(normalizedLocation);
            } catch (BadRequestException e) {
                throw new BadRequestException("Location error: " + e.getMessage());
            }

            user.setLatitude(normalizedLocation.getLatitude());
            user.setLongitude(normalizedLocation.getLongitude());
            user.setCity(normalizedLocation.getCity());
        }

        user = userRepository.save(user);

        return AuthDTO.UserResponse.builder()
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
                .build();
    }
}
