package com.example.ecommerce.repository;

import com.example.ecommerce.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUserUsername(String username);

    Optional<CartItem> findByUserUsernameAndProductId(String username, Long productId);

    void deleteByUserUsername(String username);

    void deleteByProductId(Long productId);
}
