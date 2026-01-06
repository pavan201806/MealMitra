package com.mealmitra.server.dto;

import com.mealmitra.server.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class UserDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VolunteerResponse {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String address;
        private Double latitude;
        private Double longitude;
        private String city;
        private Double reliability_score;
        private Double availability_score;
        private Boolean available;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NGOResponse {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String address;
        private Double latitude;
        private Double longitude;
        private String city;
        private Integer capacity;
        private List<String> accepted_food_types;
        private Double trust_score;
    }
}
