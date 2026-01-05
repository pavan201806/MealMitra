package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.MenuItem;
import com.example.demo.repository.MenuItemRepository;

import java.util.List;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository mir;

    public String addItem(MenuItem mi) {
        mir.save(mi);
        return "Item added successfully";
    }

    public List<MenuItem> getAllItems() {
        return mir.findAll();
    }

    public List<MenuItem> getItemsByCategory(String category) {
        return mir.findByCategory(category);
    }

    public String deleteItem(int id) {
        mir.deleteById(id);
        return "Item deleted";
    }
}
