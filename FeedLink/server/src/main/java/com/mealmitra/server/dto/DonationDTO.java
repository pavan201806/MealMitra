package com.mealmitra.server.dto;

import com.mealmitra.server.model.DonationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

public class DonationDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateDonationRequest {
        @NotBlank(message = "Food name is required")
        private String food_name;

        @NotBlank(message = "Food type is required")
        private String food_type;

        @NotBlank(message = "Quantity is required")
        private String quantity;

        @NotBlank(message = "Pickup address is required")
        private String pickup_address;

        @NotBlank(message = "Expiry time is required")
        private String expiry_time;

        @NotBlank(message = "Image URL is required")
        private String image_url;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignDonationRequest {
        @NotNull(message = "Donation ID is required")
        private Long donation_id;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompleteDonationRequest {
        @NotNull(message = "Donation ID is required")
        private Long donation_id;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DonationResponse {
        private Long id;
        private Long donor_id;
        private String food_name;
        private String food_type;
        private String quantity;
        private String pickup_address;
        private String expiry_time;
        private DonationStatus status;
        private Long volunteer_id;
        private String created_at;

        // Joined fields
        private String donor_name;
        private String donor_email;
        private String donor_phone;
        private String volunteer_name;
        private String volunteer_email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateDonationResponse {
        private String message;
        private DonationResponse donation;
        private Map<String, Object> ai_result;
    }
}
