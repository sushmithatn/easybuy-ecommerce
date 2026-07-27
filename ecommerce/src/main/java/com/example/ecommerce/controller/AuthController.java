package com.example.ecommerce.controller;

import com.example.ecommerce.dto.*;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.service.AuthService;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;
    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest req) {
        authService.register(req);
        return "User registered successfully";
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        User user = authService.authenticateAndGetUser(request);
        String token = authService.generateToken(user.getUsername());
        return new LoginResponse(token, user.getRole());
    }
}
