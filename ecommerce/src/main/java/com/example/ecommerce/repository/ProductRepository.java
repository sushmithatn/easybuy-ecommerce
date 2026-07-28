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

    @Query(value = """
        SELECT *
        FROM products p
        WHERE (:categoryId IS NULL OR p.category_id = :categoryId)
        AND (
            :search IS NULL
            OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%'))
            OR LOWER(p.brand) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%'))
            OR LOWER(p.description) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%'))
        )
        AND (:minPrice IS NULL OR p.price >= :minPrice)
        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        """,
        countQuery = """
        SELECT COUNT(*)
        FROM products p
        WHERE (:categoryId IS NULL OR p.category_id = :categoryId)
        AND (
            :search IS NULL
            OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%'))
            OR LOWER(p.brand) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%'))
            OR LOWER(p.description) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%'))
        )
        AND (:minPrice IS NULL OR p.price >= :minPrice)
        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        """,
        nativeQuery = true)
    Page<Product> filterProducts(
            @Param("categoryId") Long categoryId,
            @Param("search") String search,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            Pageable pageable
    );

}