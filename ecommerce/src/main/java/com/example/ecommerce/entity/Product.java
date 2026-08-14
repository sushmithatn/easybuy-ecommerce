package com.example.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

@Column(columnDefinition = "TEXT")
private String description;

    @Column(nullable = false)
    private double price;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private String brand;

    private int stock = 0;

    private double averageRating = 0.0;

    private double discountPercentage = 0.0; // e.g. 10% off
    
@Column(columnDefinition = "TEXT")
private String specifications;// JSON string or text block of technical details

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> galleryImages = new ArrayList<>();

    public Product(String name, String description, double price, String imageUrl) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
    }
}
