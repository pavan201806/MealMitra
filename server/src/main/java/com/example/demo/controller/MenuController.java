package com.example.demo.controller;

import com.example.demo.model.MenuItem;
import com.example.demo.repository.MenuItemRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuItemRepository menuItemRepository;

    public MenuController(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    // Get all menu items for a restaurant
    @GetMapping("/restaurant/{restaurantId}")
    public List<MenuItem> getMenuByRestaurant(@PathVariable Long restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

    // Get menu items by category
    @GetMapping("/category/{categoryId}")
    public List<MenuItem> getMenuByCategory(@PathVariable Long categoryId) {
        return menuItemRepository.findByCategoryId(categoryId);
    }

    // Get menu item by ID
    @GetMapping("/{menuItemId}")
    public MenuItem getMenuItem(@PathVariable Long menuItemId) {
        return menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
    }
}
