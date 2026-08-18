package com.example.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    @NotBlank(message = "Street address is required")
    private String shippingStreet;

    @NotBlank(message = "City is required")
    private String shippingCity;

    @NotBlank(message = "State is required")
    private String shippingState;

    @NotBlank(message = "Zip code is required")
    private String shippingZipCode;

    @NotBlank(message = "Country is required")
    private String shippingCountry;

    @NotBlank(message = "Phone number is required")
    private String shippingPhone;

    private String couponCode; // Optional

    private Double amount; // Optional explicit total amount paid from payment form
}
