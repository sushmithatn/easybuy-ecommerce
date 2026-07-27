package com.example.ecommerce.service;

import com.example.ecommerce.dto.CartItemDTO;
import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // ✅ Get all cart items for a user mapped to DTOs
    public List<CartItemDTO> getCart(String username) {
        return cartRepository.findByUserUsername(username)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ✅ Add product to cart
    @Transactional
    public void addToCart(String username, Long productId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStock() <= 0) {
            throw new BadRequestException("Product is out of stock");
        }

        CartItem item = cartRepository
                .findByUserUsernameAndProductId(username, productId)
                .orElse(new CartItem());

        if (item.getId() == null) {
            item.setUser(user);
            item.setProduct(product);
            item.setQuantity(1);
        } else {
            item.setQuantity(item.getQuantity() + 1);
        }

        cartRepository.save(item);
    }

    // ✅ Increase quantity
    @Transactional
    public void increaseQty(String username, Long cartItemId) {
        CartItem item = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getUser().getUsername().equals(username)) {
            throw new BadRequestException("Unauthorized access to cart item");
        }

        if (item.getQuantity() >= item.getProduct().getStock()) {
            throw new BadRequestException("Cannot exceed available stock limit (" + item.getProduct().getStock() + ")");
        }

        item.setQuantity(item.getQuantity() + 1);
        cartRepository.save(item);
    }

    // ✅ Decrease quantity
    @Transactional
    public void decreaseQty(String username, Long cartItemId) {
        CartItem item = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getUser().getUsername().equals(username)) {
            throw new BadRequestException("Unauthorized access to cart item");
        }

        if (item.getQuantity() > 1) {
            item.setQuantity(item.getQuantity() - 1);
            cartRepository.save(item);
        } else {
            cartRepository.delete(item);
        }
    }

    // ✅ Remove item from cart
    @Transactional
    public void removeFromCart(String username, Long cartItemId) {
        CartItem item = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getUser().getUsername().equals(username)) {
            throw new BadRequestException("Unauthorized access to cart item");
        }

        cartRepository.delete(item);
    }

    private CartItemDTO convertToDto(CartItem item) {
        return new CartItemDTO(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getImageUrl(),
                item.getProduct().getPrice(),
                item.getQuantity()
        );
    }
}
