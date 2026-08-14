package com.example.ecommerce.repository;

import com.example.ecommerce.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUserUsername(String username);

    Optional<WishlistItem> findByUserUsernameAndProductId(String username, Long productId);

    void deleteByProductId(Long productId);
}
