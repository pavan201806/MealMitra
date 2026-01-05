package com.example.demo.service;

import com.example.demo.model.Cart;
import com.example.demo.model.CartItem;
import java.util.List;

public interface CartService {
    Cart getOrCreateActiveCart(Long userId, Long restaurantId);
    Cart addItemToCart(Long userId, Long restaurantId, Long menuItemId, int quantity);
    List<CartItem> getCartItems(Long cartId);
    void removeItemFromCart(Long cartItemId);
    void clearCart(Long cartId);
}

