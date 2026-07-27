package com.example.ecommerce.repository;

import com.example.ecommerce.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o JOIN FETCH o.user WHERE o.user.username = :username")
    List<Order> findByUserUsername(@Param("username") String username);

    @Query("SELECT o FROM Order o JOIN FETCH o.user WHERE o.user IS NOT NULL")
    List<Order> findAllCustomerOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.user IS NOT NULL")
    long countAllOrders();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.user IS NOT NULL")
    double sumTotalRevenue();
}

