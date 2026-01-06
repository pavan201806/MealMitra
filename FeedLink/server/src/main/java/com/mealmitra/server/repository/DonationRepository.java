package com.mealmitra.server.repository;

import com.mealmitra.server.model.Donation;
import com.mealmitra.server.model.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    
    List<Donation> findByDonorIdOrderByCreatedAtDesc(Long donorId);
    
    List<Donation> findByStatusOrderByCreatedAtDesc(DonationStatus status);
    
    List<Donation> findByVolunteerIdAndStatusInOrderByCreatedAtDesc(
        Long volunteerId, 
        List<DonationStatus> statuses
    );
    
    @Query("SELECT d FROM Donation d ORDER BY d.createdAt DESC")
    List<Donation> findAllOrderByCreatedAtDesc();
}
