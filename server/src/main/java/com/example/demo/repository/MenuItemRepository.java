package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.MenuItem;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    // Core frontend usage
    List<MenuItem> findByRestaurantId(Long restaurantId);

    // ✅ REQUIRED for MenuController
    List<MenuItem> findByCategoryId(Long categoryId);

    // Optional filters
    List<MenuItem> findByRestaurantIdAndTypeIgnoreCase(Long restaurantId, String type);

    List<MenuItem> findByRestaurantIdAndPriceBetween(
            Long restaurantId,
            java.math.BigDecimal min,
            java.math.BigDecimal max
    );

    List<MenuItem> findByRestaurantIdAndTypeIgnoreCaseAndPriceBetween(
            Long restaurantId,
            String type,
            java.math.BigDecimal min,
            java.math.BigDecimal max
    );
}
