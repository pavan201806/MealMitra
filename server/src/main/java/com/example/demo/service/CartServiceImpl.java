package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final UsersRepository usersRepository;
    private final RestaurantRepository restaurantRepository;

    public CartServiceImpl(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            MenuItemRepository menuItemRepository,
            UsersRepository usersRepository,
            RestaurantRepository restaurantRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.usersRepository = usersRepository;
        this.restaurantRepository = restaurantRepository;
    }

    // --------------------------------------------------
    // B3: getOrCreateActiveCart
    // --------------------------------------------------
    @Override
    public Cart getOrCreateActiveCart(Long userId, Long restaurantId) {

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        return cartRepository
                .findByUserIdAndRestaurantIdAndStatus(
                        userId,
                        restaurantId,
                        CartStatus.ACTIVE.toString()
                )
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    cart.setRestaurant(restaurant);
                    cart.setStatus(CartStatus.ACTIVE.toString());
                    cart.setCreatedAt(LocalDateTime.now());
                    return cartRepository.save(cart);
                });
    }

    // --------------------------------------------------
    // B4: addItemToCart
    // --------------------------------------------------
    @Override
    public Cart addItemToCart(Long userId, Long restaurantId, Long menuItemId, int quantity) {

        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }

        Cart cart = getOrCreateActiveCart(userId, restaurantId);

        if (!cart.getStatus().equals(CartStatus.ACTIVE.toString())) {
            throw new RuntimeException("Cannot modify a checked-out cart");
        }

        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        if (!menuItem.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException("Menu item does not belong to this restaurant");
        }

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        for (CartItem item : cartItems) {
            if (item.getMenuItem().getId().equals(menuItemId)) {
                item.setQuantity(item.getQuantity() + quantity);
                cartItemRepository.save(item);
                return cart;
            }
        }

        CartItem cartItem = new CartItem();
        cartItem.setCart(cart);
        cartItem.setMenuItem(menuItem);
        cartItem.setQuantity(quantity);

        cartItemRepository.save(cartItem);
        return cart;
    }

    // --------------------------------------------------
    // B5: getCartItems
    // --------------------------------------------------
    @Override
    public List<CartItem> getCartItems(Long cartId) {

        cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        return cartItemRepository.findByCartId(cartId);
    }

    // --------------------------------------------------
    // B6: removeItemFromCart
    // --------------------------------------------------
    @Override
    public void removeItemFromCart(Long cartItemId) {

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getStatus().equals(CartStatus.ACTIVE.toString())) {
            throw new RuntimeException("Cannot modify a checked-out cart");
        }

        cartItemRepository.delete(cartItem);
    }

    // --------------------------------------------------
    // B7: clearCart
    // --------------------------------------------------
    @Override
    public void clearCart(Long cartId) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (!cart.getStatus().equals(CartStatus.ACTIVE.toString())) {
            throw new RuntimeException("Cannot clear a checked-out cart");
        }

        List<CartItem> items = cartItemRepository.findByCartId(cartId);
        cartItemRepository.deleteAll(items);
    }
}
