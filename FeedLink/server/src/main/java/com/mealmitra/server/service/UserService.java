package com.mealmitra.server.service;

import com.mealmitra.server.dto.UserDTO;
import com.mealmitra.server.model.Role;
import com.mealmitra.server.model.User;
import com.mealmitra.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getVolunteers() {
        List<User> volunteers = userRepository.findByRoleAndLatitudeIsNotNullAndLongitudeIsNotNull(Role.VOLUNTEER);

        List<UserDTO.VolunteerResponse> volunteerResponses = volunteers.stream()
                .filter(user -> isValidCoordinates(user.getLatitude(), user.getLongitude()))
                .map(user -> UserDTO.VolunteerResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .address(user.getAddress())
                        .latitude(user.getLatitude())
                        .longitude(user.getLongitude())
                        .city(user.getCity() != null ? user.getCity() : "")
                        .reliability_score(0.7) // Placeholder
                        .availability_score(0.8) // Placeholder
                        .available(true) // Placeholder
                        .build())
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("volunteers", volunteerResponses);
        return response;
    }

    public Map<String, Object> getNGOs() {
        List<User> ngos = userRepository.findByRoleAndLatitudeIsNotNullAndLongitudeIsNotNull(Role.NGO);

        List<UserDTO.NGOResponse> ngoResponses = ngos.stream()
                .filter(user -> isValidCoordinates(user.getLatitude(), user.getLongitude()))
                .map(user -> UserDTO.NGOResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .address(user.getAddress())
                        .latitude(user.getLatitude())
                        .longitude(user.getLongitude())
                        .city(user.getCity() != null ? user.getCity() : "")
                        .capacity(100) // Placeholder
                        .accepted_food_types(Arrays.asList("Cooked", "Raw", "Packaged")) // Placeholder
                        .trust_score(0.8) // Placeholder
                        .build())
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("ngos", ngoResponses);
        return response;
    }

    private boolean isValidCoordinates(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return false;
        }

        return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    }
}
