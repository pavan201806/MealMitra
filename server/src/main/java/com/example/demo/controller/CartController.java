package com.example.demo.controller;

import com.example.demo.model.Cart;
import com.example.demo.model.CartItem;
import com.example.demo.service.CartService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Get or create active cart
    @GetMapping("/active")
    public Cart getActiveCart(
            @RequestParam Long userId,
            @RequestParam Long restaurantId
    ) {
        return cartService.getOrCreateActiveCart(userId, restaurantId);
    }

    // Add item to cart
    @PostMapping("/add")
    public Cart addItemToCart(
            @RequestParam Long userId,
            @RequestParam Long restaurantId,
            @RequestParam Long menuItemId,
            @RequestParam int quantity
    ) {
        return cartService.addItemToCart(userId, restaurantId, menuItemId, quantity);
    }

    // Get all items in cart
    @GetMapping("/{cartId}/items")
    public List<CartItem> getCartItems(@PathVariable Long cartId) {
        return cartService.getCartItems(cartId);
    }

    // Remove single cart item
    @DeleteMapping("/item/{cartItemId}")
    public void removeItem(@PathVariable Long cartItemId) {
        cartService.removeItemFromCart(cartItemId);
    }

    // Clear entire cart
    @DeleteMapping("/{cartId}/clear")
    public void clearCart(@PathVariable Long cartId) {
        cartService.clearCart(cartId);
    }
}
