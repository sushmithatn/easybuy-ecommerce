package com.example.ecommerce.controller;

import com.example.ecommerce.dto.ProductDTO;
import com.example.ecommerce.entity.Category;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

import com.example.ecommerce.service.ImageSearchService;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(
    origins = {
        "http://localhost:3000",
        "https://easybuy-ecommerce.vercel.app"
    }
)
public class ProductController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final ImageSearchService imageSearchService;

    public ProductController(ProductRepository productRepository,
                             CategoryRepository categoryRepository,
                             CartRepository cartRepository,
                             WishlistRepository wishlistRepository,
                             ReviewRepository reviewRepository,
                             OrderItemRepository orderItemRepository,
                             ImageSearchService imageSearchService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.cartRepository = cartRepository;
        this.wishlistRepository = wishlistRepository;
        this.reviewRepository = reviewRepository;
        this.orderItemRepository = orderItemRepository;
        this.imageSearchService = imageSearchService;
    }

    // ✅ PUBLIC CAMERA / IMAGE VISUAL SEARCH
    @PostMapping(value = "/search-by-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> searchByImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "hint", required = false) String hint,
            @RequestParam(value = "visualLabels", required = false) String visualLabels
    ) {
        Map<String, Object> result = imageSearchService.searchProductsByImage(file, hint, visualLabels);
        return ResponseEntity.ok(result);
    }

    // ✅ PUBLIC PAGINATED & FILTERED SEARCH
    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice
    ) {
        // Adjust empty or whitespace search terms
        String searchTerm = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        // Map sort fields to Java entity property names for JPQL sorting
        String entitySortBy = sortBy;
        if ("average_rating".equalsIgnoreCase(sortBy) || "averageRating".equalsIgnoreCase(sortBy)) {
            entitySortBy = "averageRating";
        } else if ("discount_percentage".equalsIgnoreCase(sortBy) || "discountPercentage".equalsIgnoreCase(sortBy)) {
            entitySortBy = "discountPercentage";
        }

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(entitySortBy).descending() : Sort.by(entitySortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> productsPage = productRepository.filterProducts(
                categoryId, searchTerm, minPrice, maxPrice, pageable
        );

        // Fallback: Only for text search queries, NOT for category/price filters
        if (productsPage.isEmpty() && searchTerm != null && !searchTerm.trim().isEmpty()
                && categoryId == null && minPrice == null && maxPrice == null) {
            String[] tokens = searchTerm.trim().split("[,\\s]+");
            String term1 = tokens.length > 0 ? tokens[0] : null;
            String term2 = tokens.length > 1 ? tokens[1] : null;
            String term3 = tokens.length > 2 ? tokens[2] : null;

            List<Product> similarList = productRepository.searchSimilarProducts(term1, term2, term3, pageable);

            if (similarList.isEmpty()) {
                productsPage = productRepository.findAll(pageable);
            } else {
                productsPage = new PageImpl<>(similarList, pageable, similarList.size());
            }
        }

        List<ProductDTO> dtoList = productsPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        Page<ProductDTO> dtoPage = new PageImpl<>(dtoList, pageable, productsPage.getTotalElements());
        return ResponseEntity.ok(dtoPage);
    }

    // ✅ PUBLIC GET SINGLE PRODUCT DETAILS
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return ResponseEntity.ok(convertToDto(product));
    }

    // ✅ ADMIN - ADD PRODUCT
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> addProduct(@Valid @RequestBody ProductDTO dto) {
        Product product = new Product();
        mapDtoToEntity(dto, product);
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(convertToDto(saved));
    }

    // ✅ ADMIN - UPDATE PRODUCT
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO dto
    ) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        mapDtoToEntity(dto, product);
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(convertToDto(saved));
    }

    // ✅ ADMIN - DELETE PRODUCT WITH FOREIGN KEY CLEANUP
    @DeleteMapping("/{id}")
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }

        // Clean up references in dependent tables before deleting product
        cartRepository.deleteByProductId(id);
        wishlistRepository.deleteByProductId(id);
        reviewRepository.deleteByProductId(id);
        orderItemRepository.nullifyProductReference(id);

        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ProductDTO convertToDto(Product p) {
        return new ProductDTO(
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
    }

    private void mapDtoToEntity(ProductDTO dto, Product product) {
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setImageUrl(dto.getImageUrl());
        product.setBrand(dto.getBrand());
        product.setStock(dto.getStock());
        product.setDiscountPercentage(dto.getDiscountPercentage());
        product.setSpecifications(dto.getSpecifications());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        if (dto.getGalleryImages() != null) {
            product.setGalleryImages(dto.getGalleryImages());
        }
    }
}
