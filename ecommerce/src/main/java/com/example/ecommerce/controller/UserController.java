package com.example.ecommerce.controller;

import com.example.ecommerce.dto.AddressDTO;
import com.example.ecommerce.dto.UserDTO;
import com.example.ecommerce.entity.Address;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.AddressRepository;
import com.example.ecommerce.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository,
                          AddressRepository addressRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ✅ GET LOGGED IN USER PROFILE
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(convertToDto(user));
    }

    // ✅ UPDATE PROFILE DETAILS
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(Principal principal, @Valid @RequestBody UserDTO dto) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());

        User saved = userRepository.save(user);
        return ResponseEntity.ok(convertToDto(saved));
    }

    // ✅ SECURE CHANGE PASSWORD
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(Principal principal, @RequestBody Map<String, String> payload) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");

        if (oldPassword == null || newPassword == null) {
            throw new BadRequestException("Old password and new password are required");
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Incorrect old password");
        }

        // Validate strong password
        if (!newPassword.matches("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$")) {
            throw new BadRequestException("Password must be at least 8 characters long, contain at least one digit, one lowercase, one uppercase, and one special character");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok("Password changed successfully ✅");
    }

    // ✅ GET SAVED ADDRESSES
    @GetMapping("/addresses")
    public ResponseEntity<List<AddressDTO>> getAddresses(Principal principal) {
        List<AddressDTO> list = addressRepository.findByUserUsername(principal.getName()).stream()
                .map(a -> new AddressDTO(a.getId(), a.getStreet(), a.getCity(), a.getState(), a.getZipCode(), a.getCountry(), a.getPhoneNumber()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // ✅ ADD ADDRESS
    @PostMapping("/addresses")
    public ResponseEntity<AddressDTO> addAddress(Principal principal, @Valid @RequestBody AddressDTO dto) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Address addr = new Address();
        addr.setStreet(dto.getStreet());
        addr.setCity(dto.getCity());
        addr.setState(dto.getState());
        addr.setZipCode(dto.getZipCode());
        addr.setCountry(dto.getCountry());
        addr.setPhoneNumber(dto.getPhoneNumber());
        addr.setUser(user);

        Address saved = addressRepository.save(addr);
        return ResponseEntity.ok(new AddressDTO(saved.getId(), saved.getStreet(), saved.getCity(), saved.getState(), saved.getZipCode(), saved.getCountry(), saved.getPhoneNumber()));
    }

    // ✅ DELETE ADDRESS
    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(Principal principal, @PathVariable Long id) {
        Address addr = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!addr.getUser().getUsername().equals(principal.getName())) {
            throw new BadRequestException("Unauthorized address deletion");
        }

        addressRepository.delete(addr);
        return ResponseEntity.noContent().build();
    }

    private UserDTO convertToDto(User user) {
        List<AddressDTO> addressDtos = user.getAddresses().stream()
                .map(a -> new AddressDTO(
                        a.getId(),
                        a.getStreet(),
                        a.getCity(),
                        a.getState(),
                        a.getZipCode(),
                        a.getCountry(),
                        a.getPhoneNumber()
                ))
                .collect(Collectors.toList());

        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole(),
                addressDtos
        );
    }
}
