package com.example.ecommerce.controller;

import com.example.ecommerce.dto.WishlistItemDTO;
import com.example.ecommerce.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "http://localhost:3000")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<WishlistItemDTO>> getWishlist(Principal principal) {
        return ResponseEntity.ok(wishlistService.getWishlist(principal.getName()));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<String> addToWishlist(@PathVariable Long productId,
                                                Principal principal) {
        wishlistService.addToWishlist(principal.getName(), productId);
        return ResponseEntity.ok("Added to wishlist ❤️");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> remove(@PathVariable Long id, Principal principal) {
        wishlistService.remove(principal.getName(), id);
        return ResponseEntity.ok("Removed from wishlist 🗑");
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getWishlistCount(Principal principal) {
        return ResponseEntity.ok(wishlistService.getWishlist(principal.getName()).size());
    }
}
