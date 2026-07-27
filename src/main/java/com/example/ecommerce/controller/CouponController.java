package com.example.ecommerce.controller;

import com.example.ecommerce.dto.CouponDTO;
import com.example.ecommerce.entity.Coupon;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.CouponRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "http://localhost:3000")
public class CouponController {

    private final CouponRepository couponRepository;

    public CouponController(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    // ✅ PUBLIC VALIDATE COUPON
    @GetMapping("/validate/{code}")
    public ResponseEntity<CouponDTO> validateCoupon(@PathVariable String code) {
        Coupon coupon = couponRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon code not found"));

        if (!coupon.isActive()) {
            throw new BadRequestException("Coupon is inactive");
        }

        if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Coupon has expired");
        }

        return ResponseEntity.ok(convertToDto(coupon));
    }

    // ✅ ADMIN - GET ALL COUPONS
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CouponDTO>> getAllCoupons() {
        List<CouponDTO> list = couponRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // ✅ ADMIN - CREATE COUPON
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponDTO> createCoupon(@Valid @RequestBody CouponDTO dto) {
        if (couponRepository.findByCode(dto.getCode().trim().toUpperCase()).isPresent()) {
            throw new BadRequestException("Coupon code already exists");
        }

        Coupon coupon = new Coupon();
        coupon.setCode(dto.getCode().trim().toUpperCase());
        coupon.setDiscountPercentage(dto.getDiscountPercentage());
        coupon.setExpirationDate(dto.getExpirationDate());
        coupon.setActive(dto.isActive());

        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(convertToDto(saved));
    }

    // ✅ ADMIN - TOGGLE ACTIVE STATE
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponDTO> toggleCoupon(@PathVariable Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));

        coupon.setActive(!coupon.isActive());
        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(convertToDto(saved));
    }

    // ✅ ADMIN - DELETE COUPON
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon not found");
        }
        couponRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private CouponDTO convertToDto(Coupon c) {
        return new CouponDTO(
                c.getId(),
                c.getCode(),
                c.getDiscountPercentage(),
                c.getExpirationDate(),
                c.isActive()
        );
    }
}
