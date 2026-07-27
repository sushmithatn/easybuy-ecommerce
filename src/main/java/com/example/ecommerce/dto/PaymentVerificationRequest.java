package com.example.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerificationRequest {

    @NotBlank(message = "Razorpay payment ID is required")
    private String razorpayPaymentId;

    @NotBlank(message = "Razorpay order ID is required")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay signature is required")
    private String razorpaySignature;

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

    private String couponCode; // Optional coupon code
}
