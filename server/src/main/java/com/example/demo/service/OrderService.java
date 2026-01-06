package com.example.demo.service;

import com.example.demo.model.Orders;

public interface OrderService {

    Orders placeOrder(Long userId, Long restaurantId);

    Orders getOrderById(Long orderId);

    


}
