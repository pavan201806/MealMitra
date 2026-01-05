package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.model.Cart;
import com.example.demo.model.CartItem;
import com.example.demo.model.MenuItem;
import com.example.demo.repository.CartItemRepository;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.MenuItemRepository;
import com.example.demo.repository.UserRepository;

import jakarta.servlet.http.HttpSession;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class CartController {

    @Autowired
    private CartRepository cartRepo;

    @Autowired
    private CartItemRepository cartItemRepo;

    @Autowired
    private MenuItemRepository menuItemRepo;

    @Autowired
    private HttpSession session;

    @Autowired
    UserRepository ur;

    /**
     * ✅ Add an item to cart
     */
    @PostMapping("/add")
    public String addToCart(@RequestParam int menuItemId, @RequestParam int quantity) {
        Integer userId = (Integer) session.getAttribute("loggedInUser");
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not logged in");
        }

        // Find or create cart
        Cart cart = cartRepo.findByUserId(userId);
        if (cart == null) {
            cart = new Cart();
            cart.setUserId(userId);
            cartRepo.save(cart);
        }

        // Find menu item
        MenuItem menuItem = menuItemRepo.findById(menuItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));

        // Create new cart item
        CartItem cartItem = new CartItem();
        cartItem.setCart(cart);
        cartItem.setMenuItem(menuItem);
        cartItem.setQuantity(quantity);

        cartItemRepo.save(cartItem);

        return "Item added to cart";
    }

    /**
     * ✅ Get all cart items for the logged in user
     */
    @GetMapping("/getcart")
    public ResponseEntity<?> getCartItemsByUserId() {
        Integer userId = (Integer) session.getAttribute("loggedInUser");
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not logged in");
        }

        Cart cart = cartRepo.findByUserId(userId);
        if (cart == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found for user");
        }

        List<CartItem> cartItems = cartItemRepo.findByCartId(cart.getId());

        // Debug print (optional)
        System.out.println("User ID: " + userId);
        System.out.println("Cart ID: " + cart.getId());
        System.out.println("Cart Items: " + cartItems.size());

        return ResponseEntity.ok(cartItems);
    }


    @DeleteMapping("/delete/{id}")
    ResponseEntity<?> d(@PathVariable int id){
        System.out.println(id);
        CartItem t=cartItemRepo.findById(id).orElse(null);
        System.out.println(t.getId());
        cartItemRepo.delete(t);
        return ResponseEntity.ok("deleted");
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getCartItemCount() {
        Integer userId = (Integer) session.getAttribute("loggedInUser");
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not logged in");
        }
        Cart cart = cartRepo.findByUserId(userId);
        if (cart == null) {
            return ResponseEntity.ok(0);
        }

        int count = cartItemRepo.countByCartId(cart.getId());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateCartItemQuantity(
            @PathVariable int id,
            @RequestBody CartItem updatedItem) {
        Integer userId = (Integer) session.getAttribute("loggedInUser");
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not logged in");
        }

        CartItem cartItem = cartItemRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));

        

        int newQuantity = updatedItem.getQuantity();
        if (newQuantity <= 0) {
            cartItemRepo.delete(cartItem);
            return ResponseEntity.ok("Cart item deleted");
        } else {
            cartItem.setQuantity(newQuantity);
            cartItemRepo.save(cartItem);
            return ResponseEntity.ok("Cart item quantity updated");
        }
    }



    
}
