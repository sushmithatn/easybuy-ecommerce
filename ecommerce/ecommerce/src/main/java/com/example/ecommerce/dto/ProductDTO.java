package com.example.ecommerce.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private double price;
    private String imageUrl;
    private String brand;
    private int stock;
    private double averageRating;
    private double discountPercentage;
    private String specifications;
    private Long categoryId;
    private String categoryName;
    private List<String> galleryImages;
}
