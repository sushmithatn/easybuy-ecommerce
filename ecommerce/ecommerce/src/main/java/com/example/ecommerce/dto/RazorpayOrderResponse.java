package com.example.ecommerce.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderResponse {
    private String razorpayOrderId;
    private int amount; // in paise
    private String currency;
    private String keyId;
    private String receipt;
}
