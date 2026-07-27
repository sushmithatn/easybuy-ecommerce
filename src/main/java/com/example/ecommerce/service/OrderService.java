package com.example.ecommerce.service;

import com.example.ecommerce.dto.OrderDTO;
import com.example.ecommerce.dto.OrderItemDTO;
import com.example.ecommerce.dto.RazorpayOrderResponse;
import com.example.ecommerce.dto.PaymentVerificationRequest;
import com.example.ecommerce.entity.*;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.*;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final RazorpayClient razorpayClient;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartRepository cartRepository,
                        UserRepository userRepository,
                        ProductRepository productRepository,
                        CouponRepository couponRepository,
                        RazorpayClient razorpayClient) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.razorpayClient = razorpayClient;
    }

    // ✅ PLACE ORDER
    @Transactional
    public OrderDTO placeOrderWithPayment(String username, com.example.ecommerce.dto.CheckoutRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<CartItem> cartItems = cartRepository.findByUserUsername(username);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Validate stock levels before placing the order
        for (CartItem item : cartItems) {
            Product prod = item.getProduct();
            if (prod.getStock() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + prod.getName() + " (Only " + prod.getStock() + " available)");
            }
        }

        double subtotal = cartItems.stream()
                .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                .sum();

        // Calculate Coupon Discount
        double discount = 0.0;
        Coupon coupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            coupon = couponRepository.findByCode(request.getCouponCode().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));

            if (!coupon.isActive()) {
                throw new BadRequestException("Coupon is inactive");
            }
            if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDate.now())) {
                throw new BadRequestException("Coupon has expired");
            }

            discount = subtotal * (coupon.getDiscountPercentage() / 100.0);
        }

        // Calculate Tax & Shipping
        double tax = (subtotal - discount) * 0.18; // 18% GST/Tax
        double shipping = subtotal > 5000 ? 0.0 : 150.0; // Free shipping over ₹5000, else ₹150
        double total = (subtotal - discount) + tax + shipping;

        Order order = new Order();
        order.setUser(user);
        order.setStatus("PLACED");
        order.setCreatedAt(LocalDateTime.now());
        order.setTax(tax);
        order.setShippingFee(shipping);
        order.setDiscountAmount(discount);
        order.setCoupon(coupon);
        order.setTotalAmount(total);

        // Address Details
        order.setShippingStreet(request.getShippingStreet());
        order.setShippingCity(request.getShippingCity());
        order.setShippingState(request.getShippingState());
        order.setShippingZipCode(request.getShippingZipCode());
        order.setShippingCountry(request.getShippingCountry());
        order.setShippingPhone(request.getShippingPhone());

        // Payment Simulation
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus("SUCCESS");
        order.setPaymentId("PAY_" + System.currentTimeMillis());

        Order savedOrder = orderRepository.save(order);

        for (CartItem item : cartItems) {
            Product prod = item.getProduct();
            
            // Deduct Stock
            prod.setStock(prod.getStock() - item.getQuantity());
            productRepository.save(prod);

            OrderItem oi = new OrderItem();
            oi.setProduct(prod);
            oi.setProductName(prod.getName());
            oi.setPrice(prod.getPrice());
            oi.setQuantity(item.getQuantity());
            oi.setImageUrl(prod.getImageUrl());
            oi.setOrder(savedOrder);
            orderItemRepository.save(oi);
            
            savedOrder.getItems().add(oi);
        }

        // Clear Cart
        cartRepository.deleteAll(cartItems);

        return convertToDto(savedOrder);
    }

    // ✅ PLACE ORDER FROM PAYMENT PAGE (WITHOUT SEPARATE CHECKOUT STEP)
    @Transactional
    public OrderDTO placeOrderFromPaymentPage(String username, com.example.ecommerce.dto.PaymentRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<CartItem> cartItems = cartRepository.findByUserUsername(username);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Validate stock levels before placing the order
        for (CartItem item : cartItems) {
            Product prod = item.getProduct();
            if (prod.getStock() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + prod.getName() + " (Only " + prod.getStock() + " available)");
            }
        }

        double subtotal = cartItems.stream()
                .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                .sum();

        // Calculate Tax & Shipping
        double tax = subtotal * 0.18; // 18% GST/Tax
        double shipping = subtotal > 5000 ? 0.0 : 150.0; // Free shipping over ₹5000, else ₹150
        double total = subtotal + tax + shipping;

        Order order = new Order();
        order.setUser(user);
        order.setStatus("PLACED");
        order.setCreatedAt(LocalDateTime.now());
        order.setTax(tax);
        order.setShippingFee(shipping);
        order.setDiscountAmount(0.0);
        order.setTotalAmount(total);

        // Address Details
        order.setShippingStreet(request.getShippingStreet());
        order.setShippingCity(request.getShippingCity());
        order.setShippingState(request.getShippingState());
        order.setShippingZipCode(request.getShippingZipCode());
        order.setShippingCountry(request.getShippingCountry());
        order.setShippingPhone(request.getShippingPhone());

        // Payment Simulation
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus("SUCCESS");
        order.setPaymentId("PAY_" + System.currentTimeMillis());

        Order savedOrder = orderRepository.save(order);

        for (CartItem item : cartItems) {
            Product prod = item.getProduct();
            
            // Deduct Stock
            prod.setStock(prod.getStock() - item.getQuantity());
            productRepository.save(prod);

            OrderItem oi = new OrderItem();
            oi.setProduct(prod);
            oi.setProductName(prod.getName());
            oi.setPrice(prod.getPrice());
            oi.setQuantity(item.getQuantity());
            oi.setImageUrl(prod.getImageUrl());
            oi.setOrder(savedOrder);
            orderItemRepository.save(oi);
            
            savedOrder.getItems().add(oi);
        }

        // Clear Cart
        cartRepository.deleteAll(cartItems);

        return convertToDto(savedOrder);
    }

    // ✅ USER ORDERS
    public List<OrderDTO> getOrders(String username) {
        return orderRepository.findByUserUsername(username)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ✅ ADMIN – ALL ORDERS
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAllCustomerOrders()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ✅ ADMIN – UPDATE STATUS
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if ("CANCELLED".equals(order.getStatus()) || "CANCELLED_BY_CUSTOMER".equals(order.getStatus())) {
            throw new BadRequestException("Cannot update status. The order has already been cancelled.");
        }

        order.setStatus(status);
        return convertToDto(orderRepository.save(order));
    }

    public long getTotalOrders() {
        return orderRepository.countAllOrders();
    }

    public double getTotalRevenue() {
        return orderRepository.sumTotalRevenue();
    }

    private OrderDTO convertToDto(Order order) {
        List<OrderItemDTO> itemsDto = order.getItems().stream()
                .map(i -> new OrderItemDTO(
                        i.getId(),
                        i.getProduct() != null ? i.getProduct().getId() : null,
                        i.getProductName(),
                        i.getPrice(),
                        i.getQuantity(),
                        i.getImageUrl()
                ))
                .collect(Collectors.toList());

        return new OrderDTO(
                order.getId(),
                order.getUser() != null ? order.getUser().getUsername() : "anonymous",
                order.getTotalAmount(),
                order.getTax(),
                order.getShippingFee(),
                order.getDiscountAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getPaymentId(),
                order.getShippingStreet(),
                order.getShippingCity(),
                order.getShippingState(),
                order.getShippingZipCode(),
                order.getShippingCountry(),
                order.getShippingPhone(),
                order.getCoupon() != null ? order.getCoupon().getCode() : null,
                itemsDto
        );
    }

    // ✅ CREATE RAZORPAY ORDER
    public RazorpayOrderResponse createRazorpayOrder(String username, String couponCode) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<CartItem> cartItems = cartRepository.findByUserUsername(username);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Validate stock levels before creating order
        for (CartItem item : cartItems) {
            Product prod = item.getProduct();
            if (prod.getStock() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + prod.getName());
            }
        }

        double subtotal = cartItems.stream()
                .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                .sum();

        // Calculate Coupon Discount
        double discount = 0.0;
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCode(couponCode.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));

            if (!coupon.isActive()) {
                throw new BadRequestException("Coupon is inactive");
            }
            if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDate.now())) {
                throw new BadRequestException("Coupon has expired");
            }
            discount = subtotal * (coupon.getDiscountPercentage() / 100.0);
        }

        // Calculate Tax & Shipping
        double tax = (subtotal - discount) * 0.18; // 18% GST/Tax
        double shipping = subtotal > 5000 ? 0.0 : 150.0; // Free shipping over ₹5000, else ₹150
        double total = (subtotal - discount) + tax + shipping;

        try {
            int amountInPaise = (int) Math.round(total * 100);
            String receipt = "txn_" + System.currentTimeMillis();

            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", receipt);

            com.razorpay.Order order = razorpayClient.orders.create(options);
            String razorpayOrderId = order.get("id");

            return new RazorpayOrderResponse(razorpayOrderId, amountInPaise, "INR", keyId, receipt);
        } catch (RazorpayException e) {
            throw new BadRequestException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    // ✅ VERIFY PAYMENT AND PLACE ORDER
    @Transactional
    public OrderDTO verifyPaymentAndPlaceOrder(String username, PaymentVerificationRequest request) {
        // 1. Verify Razorpay Signature
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);
            if (!isValid) {
                throw new BadRequestException("Invalid payment signature");
            }
        } catch (RazorpayException e) {
            throw new BadRequestException("Payment verification failed: " + e.getMessage());
        }

        // 2. Fetch User and Cart Items
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<CartItem> cartItems = cartRepository.findByUserUsername(username);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Validate stock levels before placing the order
        for (CartItem item : cartItems) {
            Product prod = item.getProduct();
            if (prod.getStock() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + prod.getName() + " (Only " + prod.getStock() + " available)");
            }
        }

        double subtotal = cartItems.stream()
                .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                .sum();

        // Calculate Coupon Discount
        double discount = 0.0;
        Coupon coupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            coupon = couponRepository.findByCode(request.getCouponCode().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));

            if (!coupon.isActive()) {
                throw new BadRequestException("Coupon is inactive");
            }
            if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDate.now())) {
                throw new BadRequestException("Coupon has expired");
            }
            discount = subtotal * (coupon.getDiscountPercentage() / 100.0);
        }

        // Calculate Tax & Shipping
        double tax = (subtotal - discount) * 0.18; // 18% GST/Tax
        double shipping = subtotal > 5000 ? 0.0 : 150.0; // Free shipping over ₹5000, else ₹150
        double total = (subtotal - discount) + tax + shipping;

        Order order = new Order();
        order.setUser(user);
        order.setStatus("PLACED");
        order.setCreatedAt(LocalDateTime.now());
        order.setTax(tax);
        order.setShippingFee(shipping);
        order.setDiscountAmount(discount);
        order.setCoupon(coupon);
        order.setTotalAmount(total);

        // Address Details
        order.setShippingStreet(request.getShippingStreet());
        order.setShippingCity(request.getShippingCity());
        order.setShippingState(request.getShippingState());
        order.setShippingZipCode(request.getShippingZipCode());
        order.setShippingCountry(request.getShippingCountry());
        order.setShippingPhone(request.getShippingPhone());

        // Payment Details (Verified Razorpay Info)
        order.setPaymentMethod("RAZORPAY");
        order.setPaymentStatus("SUCCESS");
        order.setPaymentId(request.getRazorpayPaymentId()); // Store verification ID

        Order savedOrder = orderRepository.save(order);

        for (CartItem item : cartItems) {
            Product prod = item.getProduct();
            
            // Deduct Stock
            prod.setStock(prod.getStock() - item.getQuantity());
            productRepository.save(prod);

            OrderItem oi = new OrderItem();
            oi.setProduct(prod);
            oi.setProductName(prod.getName());
            oi.setPrice(prod.getPrice());
            oi.setQuantity(item.getQuantity());
            oi.setImageUrl(prod.getImageUrl());
            oi.setOrder(savedOrder);
            orderItemRepository.save(oi);
            
            savedOrder.getItems().add(oi);
        }

        // Clear Cart
        cartRepository.deleteAll(cartItems);

        return convertToDto(savedOrder);
    }

    // ✅ CUSTOMER CANCEL ORDER
    @Transactional
    public OrderDTO cancelOrder(String username, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Security Check: Verify order belongs to the user
        if (order.getUser() == null || !order.getUser().getUsername().equals(username)) {
            throw new BadRequestException("You are not authorized to cancel this order");
        }

        // Status Check: Can only cancel if PLACED or PENDING
        if (!"PLACED".equals(order.getStatus()) && !"PENDING".equals(order.getStatus())) {
            throw new BadRequestException("Order cannot be cancelled. Current status: " + order.getStatus());
        }

        order.setStatus("CANCELLED_BY_CUSTOMER");
        
        // Update payment status
        if ("SUCCESS".equals(order.getPaymentStatus())) {
            order.setPaymentStatus("REFUNDED");
        } else {
            order.setPaymentStatus("CANCELLED");
        }

        // Restore Stock
        for (OrderItem item : order.getItems()) {
            Product prod = item.getProduct();
            if (prod != null) {
                prod.setStock(prod.getStock() + item.getQuantity());
                productRepository.save(prod);
            }
        }

        return convertToDto(orderRepository.save(order));
    }
}
