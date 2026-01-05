package com.example.demo.repository;

import com.example.demo.model.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {

    // Get all categories for a restaurant
    List<MenuCategory> findByRestaurantId(Long restaurantId);
}
