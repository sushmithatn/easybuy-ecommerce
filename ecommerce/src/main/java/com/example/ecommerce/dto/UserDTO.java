package com.example.ecommerce.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String role;
    private List<AddressDTO> addresses;
}
