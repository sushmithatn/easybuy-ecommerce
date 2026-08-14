package com.example.ecommerce.service;

import com.example.ecommerce.dto.LoginRequest;
import com.example.ecommerce.dto.RegisterRequest;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // REGISTER
    public void register(RegisterRequest request) {
        String cleanUsername = request.getUsername() != null ? request.getUsername().trim() : "";
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim() : "";

        if (userRepository.findByUsernameIgnoreCase(cleanUsername).isPresent()) {
            throw new BadRequestException("Username is already taken");
        }

        if (!cleanEmail.isEmpty() && userRepository.findByEmailIgnoreCase(cleanEmail).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setUsername(cleanUsername);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(cleanEmail);
        user.setFullName(request.getFullName() != null ? request.getFullName().trim() : "");
        user.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : "");

        if (request.getRole() != null && (request.getRole().equalsIgnoreCase("ROLE_ADMIN") || request.getRole().equalsIgnoreCase("ADMIN"))) {
            user.setRole("ROLE_ADMIN");
        } else {
            user.setRole("ROLE_USER");
        }

        userRepository.save(user);
    }

    // LOGIN
    public User authenticateAndGetUser(LoginRequest request) {
        String cleanUsername = request.getUsername() != null ? request.getUsername().trim() : "";

        User user = userRepository.findByUsernameIgnoreCase(cleanUsername)
                .or(() -> userRepository.findByEmailIgnoreCase(cleanUsername))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        request.getPassword()
                )
        );

        return user;
    }


    // Generate token
    public String generateToken(String username) {
        return jwtUtil.generateToken(username);
    }
}
