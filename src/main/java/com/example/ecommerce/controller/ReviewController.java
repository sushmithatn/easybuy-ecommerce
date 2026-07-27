package com.example.ecommerce.controller;

import com.example.ecommerce.dto.ReviewDTO;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.Review;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.ReviewRepository;
import com.example.ecommerce.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository,
                            ProductRepository productRepository,
                            UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // ✅ PUBLIC GET REVIEWS FOR PRODUCT
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getProductReviews(@PathVariable Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found");
        }

        List<ReviewDTO> list = reviewRepository.findByProductId(productId).stream()
                .map(r -> new ReviewDTO(
                        r.getId(),
                        r.getUser().getUsername(),
                        r.getUser().getFullName(),
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    // ✅ USER SUBMIT REVIEW (Securely captures username via Principal context)
    @PostMapping("/product/{productId}")
    public ResponseEntity<ReviewDTO> addReview(
            Principal principal,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewDTO dto
    ) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setCreatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);

        // Recalculate average rating for the product
        List<Review> reviews = reviewRepository.findByProductId(productId);
        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        // Round to 1 decimal place
        average = Math.round(average * 10.0) / 10.0;
        product.setAverageRating(average);
        productRepository.save(product);

        ReviewDTO responseDto = new ReviewDTO(
                saved.getId(),
                user.getUsername(),
                user.getFullName(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt()
        );

        return ResponseEntity.ok(responseDto);
    }
}
