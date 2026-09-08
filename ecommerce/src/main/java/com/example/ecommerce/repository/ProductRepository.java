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
        SELECT p FROM Product p
        LEFT JOIN FETCH p.category
        WHERE (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (
            :search IS NULL OR :search = ''
            OR LOWER(p.name) LIKE LOWER(CONCAT('%', LOWER(:search), '%'))
            OR LOWER(p.brand) LIKE LOWER(CONCAT('%', LOWER(:search), '%'))
            OR LOWER(p.description) LIKE LOWER(CONCAT('%', LOWER(:search), '%'))
        )
        AND (:minPrice IS NULL OR p.price >= :minPrice)
        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        """,
        countQuery = """
        SELECT COUNT(p) FROM Product p
        WHERE (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (
            :search IS NULL OR :search = ''
            OR LOWER(p.name) LIKE LOWER(CONCAT('%', LOWER(:search), '%'))
            OR LOWER(p.brand) LIKE LOWER(CONCAT('%', LOWER(:search), '%'))
            OR LOWER(p.description) LIKE LOWER(CONCAT('%', LOWER(:search), '%'))
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