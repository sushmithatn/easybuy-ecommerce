package com.example.ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private double totalAmount;
    private double tax = 0.0;
    private double shippingFee = 0.0;
    private double discountAmount = 0.0;

    private String status = "PLACED"; // PLACED, SHIPPED, DELIVERED, CANCELLED
    private LocalDateTime createdAt = LocalDateTime.now();

    private String paymentMethod;
    private String paymentStatus;
    private String paymentId;

    // Shipping details
    private String shippingStreet;
    private String shippingCity;
    private String shippingState;
    private String shippingZipCode;
    private String shippingCountry;
    private String shippingPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @JsonManagedReference
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}
