package com.example.ecommerce.service;

import com.example.ecommerce.dto.ProductDTO;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ImageSearchService {

    private final ProductRepository productRepository;

    public ImageSearchService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Analyzes image file & AI visual labels from frontend classifier, returning exact & similar products.
     */
    public Map<String, Object> searchProductsByImage(MultipartFile file, String hint, String visualLabels) {
        Map<String, Object> response = new HashMap<>();

        // Extract clean tokenized terms from AI visual labels, user hint, and image metadata
        List<String> terms = extractTerms(file, hint, visualLabels);
        
        String primaryTerm = !terms.isEmpty() ? terms.get(0) : "Products";
        String term1 = terms.size() > 0 ? terms.get(0) : null;
        String term2 = terms.size() > 1 ? terms.get(1) : null;
        String term3 = terms.size() > 2 ? terms.get(2) : null;

        // Query repository for similar items using multi-term search
        List<Product> matchedProducts = productRepository.searchSimilarProducts(
                term1, term2, term3, PageRequest.of(0, 16, Sort.by("id").descending())
        );

        // Fallback / Supplemental: If fewer than 4 products matched, fetch additional catalog items
        if (matchedProducts.size() < 4) {
            List<Product> extraProducts = productRepository.findAll(
                    PageRequest.of(0, 12, Sort.by("id").descending())
            ).getContent();

            Set<Long> existingIds = matchedProducts.stream().map(Product::getId).collect(Collectors.toSet());
            for (Product p : extraProducts) {
                if (!existingIds.contains(p.getId())) {
                    matchedProducts.add(p);
                    if (matchedProducts.size() >= 12) break;
                }
            }
        }

        List<ProductDTO> dtos = matchedProducts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        response.put("detectedTerm", capitalize(primaryTerm));
        response.put("allTerms", terms);
        response.put("totalResults", dtos.size());
        response.put("products", dtos);
        response.put("timestamp", System.currentTimeMillis());

        return response;
    }

    private List<String> extractTerms(MultipartFile file, String hint, String visualLabels) {
        Set<String> termSet = new LinkedHashSet<>();

        if (hint != null && !hint.trim().isEmpty()) {
            termSet.add(hint.trim().toLowerCase());
        }

        if (visualLabels != null && !visualLabels.trim().isEmpty()) {
            String lowerLabels = visualLabels.toLowerCase();
            
            // Map AI predictions to catalog keywords
            if (containsAny(lowerLabels, "shoe", "sneaker", "footwear", "boot", "sandal", "loafer", "running shoe", "clog")) {
                termSet.add("shoe");
                termSet.add("sneakers");
            }
            if (containsAny(lowerLabels, "watch", "stopwatch", "digital watch", "analog watch", "clock", "timer")) {
                termSet.add("watch");
                termSet.add("smartwatch");
            }
            if (containsAny(lowerLabels, "phone", "cellphone", "cellular", "mobile", "ipod", "smartphone", "handheld")) {
                termSet.add("phone");
                termSet.add("mobile");
            }
            if (containsAny(lowerLabels, "laptop", "notebook", "computer", "macbook", "screen", "monitor", "keyboard")) {
                termSet.add("laptop");
                termSet.add("computer");
            }
            if (containsAny(lowerLabels, "headphone", "earphone", "headset", "earbud", "audio", "speaker", "sound")) {
                termSet.add("headphone");
                termSet.add("audio");
            }
            if (containsAny(lowerLabels, "jersey", "t-shirt", "shirt", "coat", "jacket", "sweater", "jean", "pant", "suit", "cloth", "dress")) {
                termSet.add("shirt");
                termSet.add("clothing");
            }
            if (containsAny(lowerLabels, "camera", "reflex camera", "lens")) {
                termSet.add("camera");
            }
            if (containsAny(lowerLabels, "sunglass", "spectacles", "eyeglasses", "glasses")) {
                termSet.add("sunglasses");
            }
            if (containsAny(lowerLabels, "bag", "backpack", "purse", "wallet", "luggage")) {
                termSet.add("bag");
            }

            // Also add raw words from visual labels split by comma or space
            String[] tokens = lowerLabels.split("[,\\s]+");
            for (String token : tokens) {
                String clean = token.replaceAll("[^a-zA-Z]", "").trim();
                if (clean.length() > 3 && !isStopWord(clean)) {
                    termSet.add(clean);
                }
            }
        }

        // File name fallback analysis
        if (file != null && file.getOriginalFilename() != null) {
            String fname = file.getOriginalFilename().toLowerCase();
            if (fname.contains("shoe") || fname.contains("sneaker")) termSet.add("shoe");
            else if (fname.contains("watch")) termSet.add("watch");
            else if (fname.contains("phone")) termSet.add("phone");
            else if (fname.contains("laptop")) termSet.add("laptop");
        }

        if (termSet.isEmpty()) {
            termSet.add("electronics");
            termSet.add("fashion");
        }

        return new ArrayList<>(termSet);
    }

    private boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    private boolean isStopWord(String word) {
        return Set.of("with", "that", "this", "from", "have", "some", "what", "where", "when", "your", "photo", "image", "file", "capture").contains(word);
    }

    private String capitalize(String text) {
        if (text == null || text.isEmpty()) return text;
        return text.substring(0, 1).toUpperCase() + text.substring(1);
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
}
