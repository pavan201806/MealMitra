package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.demo.model.Orders;
import com.example.demo.repository.OrdersRepository;
import com.example.demo.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrdersRepository ordersRepository;
    private final OrderService orderService;

    public OrderController(OrdersRepository ordersRepository, OrderService orderService) {
        this.ordersRepository = ordersRepository;
        this.orderService = orderService;
    }

    @PostMapping("/place")
    public Orders placeOrder(
            @RequestParam Long userId,
            @RequestParam Long restaurantId
    ) {
        return orderService.placeOrder(userId, restaurantId);
    }

    @GetMapping("/{userId}")
    public List<Orders> getOrdersByUser(@PathVariable Long userId) {
        return ordersRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
