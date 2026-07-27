package com.example.ecommerce;

import com.example.ecommerce.service.OrderService;
import com.example.ecommerce.dto.OrderDTO;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import java.util.List;

public class DbQueryToolSpring {
    public static void main(String[] args) {
        System.out.println("=== RUNNING DB QUERY TOOL SPRING ===");
        try {
            ConfigurableApplicationContext context = SpringApplication.run(EcommerceApplication.class, args);
            OrderService orderService = context.getBean(OrderService.class);
            List<OrderDTO> orders = orderService.getAllOrders();
            System.out.println("ORDERS COUNT IN SERVICE: " + orders.size());
            for (OrderDTO o : orders) {
                System.out.println("ORDER: id=" + o.getId() + ", user=" + o.getUsername() + ", total=" + o.getTotalAmount() + ", status=" + o.getStatus());
            }
            context.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("=== DB QUERY TOOL SPRING END ===");
    }
}


