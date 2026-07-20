package com.example.ecommerce.controller;

import com.example.ecommerce.dto.CartItemDTO;
import com.example.ecommerce.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // ✅ Add product to cart
    @PostMapping("/add/{productId}")
    public ResponseEntity<String> addToCart(
            Principal principal,
            @PathVariable Long productId) {

        cartService.addToCart(principal.getName(), productId);
        return ResponseEntity.ok("Added to cart 🛒");
    }

    // ✅ Get all cart items for user
    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCart(Principal principal) {
        return ResponseEntity.ok(cartService.getCart(principal.getName()));
    }

    // ✅ Increase quantity
    @PutMapping("/increase/{id}")
    public ResponseEntity<String> increaseQty(
            Principal principal,
            @PathVariable Long id) {

        cartService.increaseQty(principal.getName(), id);
        return ResponseEntity.ok("Quantity increased ✅");
    }

    // ✅ Decrease quantity
    @PutMapping("/decrease/{id}")
    public ResponseEntity<String> decreaseQty(
            Principal principal,
            @PathVariable Long id) {

        cartService.decreaseQty(principal.getName(), id);
        return ResponseEntity.ok("Quantity decreased ✅");
    }

    // ✅ Remove item from cart
    @DeleteMapping("/{id}")
    public ResponseEntity<String> removeItem(
            Principal principal,
            @PathVariable Long id) {

        cartService.removeFromCart(principal.getName(), id);
        return ResponseEntity.ok("Item removed 🗑");
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getCartCount(Principal principal) {
        int count = cartService.getCart(principal.getName()).stream()
                .mapToInt(CartItemDTO::getQuantity)
                .sum();
        return ResponseEntity.ok(count);
    }
}
