package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.Cart;
import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserIdAndRestaurantIdAndStatus(Long userId, Long restaurantId, String status);
    List<Cart> findByUserId(Long userId);
}
