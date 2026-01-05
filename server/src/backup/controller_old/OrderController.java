package com.example.demo.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.demo.model.OrderItem;
import com.example.demo.repository.OrderItemRepository;
import com.example.demo.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Cart;
import com.example.demo.model.CartItem;
import com.example.demo.model.Order;
import com.example.demo.repository.CartItemRepository;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.OrderRepository;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/order")
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderRepository or;

    @Autowired
    private HttpSession session;

    @Autowired
    CartRepository cr;

    @Autowired
    CartItemRepository cir;

    @Autowired
    OrderItemRepository orderItemRepository;

    @Autowired
    MenuItemRepository menuItemRepository;

    // ✅ Checkout: Create Order, OrderItems, Clear Cart
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Order request) {
        Integer userId = (Integer) session.getAttribute("loggedInUser");
        if (userId == null) {
            return ResponseEntity.status(401).body("User not logged in");
        }

        // Get user's cart and items
        Cart cart = cr.findByUserId(userId);
        List<CartItem> cartItems = cir.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body("Cart is empty");
        }

        // Save order
        request.setOrderStatus("Pending");
        request.setUserId(userId);
        Order savedOrder = or.save(request);

        // Copy cart items → order items
        cartItems.forEach(cartItem -> {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setMenuItem(cartItem.getMenuItem());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getMenuItem().getPrice());
            orderItemRepository.save(orderItem);
        });

        // Clear cart
        cir.deleteAll(cartItems);

        // Response
        Map<String, Object> response = Map.of(
                "message", "Order placed successfully",
                "order", savedOrder
        );

        return ResponseEntity.ok(response);
    }

    // ✅ Get all orders with their ordered items
    @GetMapping("/getorder")
    public ResponseEntity<?> getAllOrders() {
        List<Order> orders = or.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Order o : orders) {
            List<OrderItem> orderItems = orderItemRepository.findByOrderId(o.getId());

            Map<String, Object> orderWithItems = new HashMap<>();
            orderWithItems.put("order", o);
            orderWithItems.put("items", orderItems);

            result.add(orderWithItems);
        }

        return ResponseEntity.ok(result);
    }

    // ✅ Clear cart manually if needed
    @DeleteMapping("/clearCart")
    public ResponseEntity<?> clearCart() {
        Integer userId = (Integer) session.getAttribute("loggedInUser");
        if (userId == null) {
            return ResponseEntity.status(401).body("User not logged in");
        }

        Cart cart = cr.findByUserId(userId);
        List<CartItem> cartItems = cir.findByCartId(cart.getId());

        cir.deleteAll(cartItems);

        return ResponseEntity.ok("Cart cleared");
    }

    // ✅ Update order status by ID
    @PutMapping("/updateStatus/{orderId}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Integer orderId, @RequestBody Map<String, String> body) {
        Order order = or.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseEntity.status(404).body("Order not found");
        }

        String newStatus = body.get("status");
        order.setOrderStatus(newStatus);
        or.save(order);

        return ResponseEntity.ok("Order status updated successfully");
    }

}
