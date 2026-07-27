package com.example.ecommerce.repository;

import com.example.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
    SELECT p FROM Product p WHERE
    (:categoryId IS NULL OR p.category.id = :categoryId)
    AND
    (
        :search IS NULL OR
        LOWER(CAST(p.name AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
        OR LOWER(CAST(p.brand AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
        OR LOWER(CAST(p.description AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
    )
    AND (:minPrice IS NULL OR p.price >= :minPrice)
    AND (:maxPrice IS NULL OR p.price <= :maxPrice)
    """)
    Page<Product> filterProducts(
            @Param("categoryId") Long categoryId,
            @Param("search") String search,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            Pageable pageable
    );
}