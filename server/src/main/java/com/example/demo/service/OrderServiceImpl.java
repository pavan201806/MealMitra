package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrdersRepository ordersRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UsersRepository usersRepository;
    private final RestaurantRepository restaurantRepository;

    public OrderServiceImpl(
            OrdersRepository ordersRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            UsersRepository usersRepository,
            RestaurantRepository restaurantRepository
    ) {
        this.ordersRepository = ordersRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.usersRepository = usersRepository;
        this.restaurantRepository = restaurantRepository;
    }

    // --------------------------------------------------
    // Place Order (Cart → Orders)
    // --------------------------------------------------
    @Override
    public Orders placeOrder(Long userId, Long restaurantId) {

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Cart cart = cartRepository
                .findByUserIdAndRestaurantIdAndStatus(
                        userId,
                        restaurantId,
                        CartStatus.ACTIVE.toString()
                )
                .orElseThrow(() -> new RuntimeException("Active cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cannot place order with empty cart");
        }

        // Create Orders
        Orders orders = new Orders();
        orders.setUser(user);
        orders.setRestaurant(restaurant);
        orders.setStatus(OrderStatus.PLACED.toString());
        orders.setCreatedAt(LocalDateTime.now());

        BigDecimal totalAmount = BigDecimal.ZERO;
        orders = ordersRepository.save(orders);

        // Convert CartItems → OrderItems
        for (CartItem cartItem : cartItems) {

            MenuItem menuItem = cartItem.getMenuItem();

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(orders);
            orderItem.setMenuItem(menuItem);

            // Snapshot fields
            orderItem.setItemName(menuItem.getName());
            orderItem.setItemPrice(menuItem.getPrice().doubleValue());
            orderItem.setQuantity(cartItem.getQuantity());

            orderItemRepository.save(orderItem);

            BigDecimal itemTotal =
                    menuItem.getPrice().multiply(
                            BigDecimal.valueOf(cartItem.getQuantity())
                    );

            totalAmount = totalAmount.add(itemTotal);
        }

        // Update total amount
        orders.setTotalAmount(totalAmount.doubleValue());
        ordersRepository.save(orders);

        // Lock cart
        cart.setStatus(CartStatus.CHECKED_OUT.toString());
        cartRepository.save(cart);

        return orders;
    }

    // --------------------------------------------------
    // Fetch Order by ID
    // --------------------------------------------------
    @Override
    public Orders getOrderById(Long orderId) {

        return ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    
}
