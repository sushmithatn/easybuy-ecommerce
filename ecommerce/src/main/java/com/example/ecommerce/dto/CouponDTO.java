package com.example.ecommerce.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CouponDTO {
    private Long id;
    private String code;
    private double discountPercentage;
    private LocalDate expirationDate;
    private boolean active;
}
