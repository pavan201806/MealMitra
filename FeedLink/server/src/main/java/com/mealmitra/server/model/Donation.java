package com.mealmitra.server.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Donation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Donor ID is required")
    @Column(name = "donor_id", nullable = false)
    private Long donorId;
    
    @NotBlank(message = "Food name is required")
    @Column(name = "food_name", nullable = false)
    private String foodName;
    
    @NotBlank(message = "Food type is required")
    @Column(name = "food_type", nullable = false)
    private String foodType;
    
    @NotBlank(message = "Quantity is required")
    @Column(nullable = false)
    private String quantity;
    
    @NotBlank(message = "Pickup address is required")
    @Column(name = "pickup_address", nullable = false)
    private String pickupAddress;
    
    @NotBlank(message = "Expiry time is required")
    @Column(name = "expiry_time", nullable = false)
    private String expiryTime;
    
    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DonationStatus status = DonationStatus.PENDING;
    
    @Column(name = "volunteer_id")
    private Long volunteerId;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Transient fields for joined data (not stored in DB)
    @Transient
    private String donorName;
    
    @Transient
    private String donorEmail;
    
    @Transient
    private String donorPhone;
    
    @Transient
    private String volunteerName;
    
    @Transient
    private String volunteerEmail;
}
