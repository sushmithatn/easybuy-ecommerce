package com.example.ecommerce.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private String username;
    private double totalAmount;
    private double tax;
    private double shippingFee;
    private double discountAmount;
    private String status;
    private LocalDateTime createdAt;
    private String paymentMethod;
    private String paymentStatus;
    private String paymentId;

    private String shippingStreet;
    private String shippingCity;
    private String shippingState;
    private String shippingZipCode;
    private String shippingCountry;
    private String shippingPhone;

    private String couponCode;
    private List<OrderItemDTO> items;
}
