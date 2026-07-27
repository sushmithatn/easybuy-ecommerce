package com.example.ecommerce.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private double price;
    private int quantity;
    private String imageUrl;
}
