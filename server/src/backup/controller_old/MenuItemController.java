package com.example.demo.controller;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.model.MenuItem;
import com.example.demo.repository.MenuItemRepository;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/admin")
public class MenuItemController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    // Store uploaded images inside project root /uploads
    private final String uploadDir = System.getProperty("user.dir") + "/uploads/";

    @PostMapping("/addItem")
    public ResponseEntity<String> addMenuItem(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("price") double price,
            @RequestParam("type") String type,
            @RequestParam("image") MultipartFile imageFile
    ) {
        try {
            // Generate unique filename
            String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();

            // Create directories if not exist
            Path path = Paths.get(uploadDir + fileName);
            Files.createDirectories(path.getParent());

            // Copy file safely
            Files.copy(imageFile.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            // Save MenuItem entity
            MenuItem menuItem = new MenuItem();
            menuItem.setName(name);
            menuItem.setDescription(description);
            menuItem.setCategory(category);
            menuItem.setPrice(price);
            menuItem.setType(type);
            menuItem.setImageUrl(fileName);

            menuItemRepository.save(menuItem);

            return ResponseEntity.ok("Menu item added successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/getall")
    public List<MenuItem> getAll() {
        return menuItemRepository.findAll();
    }

    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws Exception {
        Path path = Paths.get(uploadDir).resolve(filename);

        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(path.toUri());

        String contentType = Files.probeContentType(path);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> update(@PathVariable int id, @RequestBody MenuItem mi) {
        MenuItem existingItem = menuItemRepository.findById(id).orElse(null);
        if (existingItem == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Item not found");
        }

        existingItem.setName(mi.getName());
        existingItem.setDescription(mi.getDescription());
        existingItem.setCategory(mi.getCategory());
        existingItem.setPrice(mi.getPrice());
        existingItem.setType(mi.getType());

        menuItemRepository.save(existingItem);
        return ResponseEntity.ok("Updated successfully.");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable int id) {
        MenuItem item = menuItemRepository.findById(id).orElse(null);
        if (item == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Item not found");
        }

        // Delete the image file if it exists
        Path imagePath = Paths.get(uploadDir).resolve(item.getImageUrl());
        try {
            Files.deleteIfExists(imagePath);
        } catch (Exception e) {
            e.printStackTrace();
        }

        menuItemRepository.delete(item);
        return ResponseEntity.ok("Deleted successfully.");
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getItemById(@PathVariable int id) {
        MenuItem item = menuItemRepository.findById(id).orElse(null);
        if (item == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Item not found");
        }
        return ResponseEntity.ok(item);
    }

    @GetMapping("/filter")
    public ResponseEntity<?> filterMenuItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice
    ) {
        // Normalize category and type
        String normalizedCategory = (category == null || category.trim().isEmpty() || category.equalsIgnoreCase("all"))
                ? null : category.trim().toLowerCase();

        String normalizedType = (type == null || type.trim().isEmpty() || type.equalsIgnoreCase("all"))
                ? null : type.trim().toLowerCase();

        // Default prices
        double min = (minPrice == null || minPrice < 0) ? 0.0 : minPrice;
        double max = (maxPrice == null || maxPrice <= 0) ? Double.MAX_VALUE : maxPrice;

        if (min > max) {
            return ResponseEntity.badRequest().body("minPrice cannot be greater than maxPrice");
        }

        List<MenuItem> filteredItems;

        if (normalizedCategory == null && normalizedType == null) {
            // No filters → all items in price range
            filteredItems = menuItemRepository.findByPriceBetween(min, max);
        } else if (normalizedCategory != null && normalizedType == null) {
            // Category only
            filteredItems = menuItemRepository.findByCategoryIgnoreCaseAndPriceBetween(
                    normalizedCategory, min, max);
        } else if (normalizedCategory == null && normalizedType != null) {
            // Type only
            filteredItems = menuItemRepository.findByTypeIgnoreCaseAndPriceBetween(
                    normalizedType, min, max);
        } else {
            // Both
            filteredItems = menuItemRepository.findByCategoryIgnoreCaseAndTypeIgnoreCaseAndPriceBetween(
                    normalizedCategory, normalizedType, min, max);
        }

        return ResponseEntity.ok(filteredItems);
    }

}
