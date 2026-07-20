package com.example.ecommerce.service;

import com.example.ecommerce.dto.ProductDTO;
import com.example.ecommerce.dto.WishlistItemDTO;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.entity.WishlistItem;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public WishlistService(WishlistRepository wishlistRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<WishlistItemDTO> getWishlist(String username) {
        return wishlistRepository.findByUserUsername(username)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addToWishlist(String username, Long productId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (wishlistRepository.findByUserUsernameAndProductId(username, productId).isPresent()) {
            return; // Already in wishlist
        }

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);

        wishlistRepository.save(item);
    }

    @Transactional
    public void remove(String username, Long id) {
        WishlistItem item = wishlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));

        if (!item.getUser().getUsername().equals(username)) {
            throw new BadRequestException("Unauthorized access to wishlist item");
        }

        wishlistRepository.delete(item);
    }

    private WishlistItemDTO convertToDto(WishlistItem item) {
        Product p = item.getProduct();
        ProductDTO productDto = new ProductDTO(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getImageUrl(),
                p.getBrand(),
                p.getStock(),
                p.getAverageRating(),
                p.getDiscountPercentage(),
                p.getSpecifications(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getGalleryImages()
        );
        return new WishlistItemDTO(item.getId(), productDto);
    }
}
