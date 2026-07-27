package com.example.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Long id;

    @NotBlank(message = "Category name is required")
    private String name;
}
