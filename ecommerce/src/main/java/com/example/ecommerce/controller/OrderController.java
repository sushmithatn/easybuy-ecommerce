package com.example.ecommerce.controller;

import com.example.ecommerce.dto.CheckoutRequest;
import com.example.ecommerce.dto.OrderDTO;
import com.example.ecommerce.dto.PaymentRequest;
import com.example.ecommerce.dto.RazorpayOrderResponse;
import com.example.ecommerce.dto.PaymentVerificationRequest;
import com.example.ecommerce.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // ✅ SECURE CHECKOUT: extract user context from Principal, validate request inputs
    @PostMapping("/checkout")
    public ResponseEntity<OrderDTO> placeOrder(
            Principal principal,
            @Valid @RequestBody CheckoutRequest request) {

        OrderDTO order = orderService.placeOrderWithPayment(principal.getName(), request);
        return ResponseEntity.ok(order);
    }

    // ✅ DIRECT PAYMENT FOR USER (Used when navigating from Buy button)
    @PostMapping("/pay/{username}")
    public ResponseEntity<OrderDTO> pay(
            @PathVariable String username,
            @Valid @RequestBody PaymentRequest request) {

        OrderDTO order = orderService.placeOrderFromPaymentPage(username, request);
        return ResponseEntity.ok(order);
    }

    // ✅ CREATE RAZORPAY ORDER
    @PostMapping("/razorpay/create")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(
            Principal principal,
            @RequestParam(required = false) String couponCode) {
        
        RazorpayOrderResponse response = orderService.createRazorpayOrder(principal.getName(), couponCode);
        return ResponseEntity.ok(response);
    }

    // ✅ VERIFY PAYMENT AND PLACE ORDER
    @PostMapping("/razorpay/verify")
    public ResponseEntity<OrderDTO> verifyRazorpayPayment(
            Principal principal,
            @Valid @RequestBody PaymentVerificationRequest request) {

        OrderDTO order = orderService.verifyPaymentAndPlaceOrder(principal.getName(), request);
        return ResponseEntity.ok(order);
    }

    // ✅ GET USER ORDERS SECURELY (No URL param required)
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getUserOrders(Principal principal) {
        return ResponseEntity.ok(orderService.getOrders(principal.getName()));
    }

    // ✅ ADMIN – UPDATE ORDER STATUS
    @PutMapping("/admin/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    // ✅ ADMIN - GET ANALYTICS
    @GetMapping("/admin/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminAnalytics() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalOrders", orderService.getTotalOrders());
        data.put("totalRevenue", orderService.getTotalRevenue());
        return ResponseEntity.ok(data);
    }

    // ✅ ADMIN - GET ALL ORDERS
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // ✅ CUSTOMER CANCEL ORDER
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(
            Principal principal,
            @PathVariable Long orderId) {
        OrderDTO order = orderService.cancelOrder(principal.getName(), orderId);
        return ResponseEntity.ok(order);
    }
}
