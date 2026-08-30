package com.kfashn.controller;

import com.kfashn.entity.Order;
import com.kfashn.entity.OrderItem;
import com.kfashn.entity.Product;
import com.kfashn.repository.OrderRepository;
import com.kfashn.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> payload) {
        try {
            String userEmail = (String) payload.get("userEmail");
            
            // Ensure total is handled as a number properly
            Object totalObj = payload.get("total");
            BigDecimal total = new BigDecimal(totalObj.toString());

            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) payload.get("items");

            Order order = new Order();
            order.setOrderId("ORD" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4));
            order.setUserEmail(userEmail);
            order.setTotal(total);

            List<OrderItem> orderItems = new ArrayList<>();
            for (Map<String, Object> itemData : itemsData) {
                Long productId = Long.valueOf(itemData.get("id").toString());
                Integer quantity = Integer.valueOf(itemData.get("quantity").toString());
                BigDecimal price = new BigDecimal(itemData.get("price").toString());

                Product product = productRepository.findById(productId).orElse(null);
                if (product != null) {
                    OrderItem item = new OrderItem();
                    item.setProduct(product);
                    item.setQuantity(quantity);
                    item.setPrice(price);
                    orderItems.add(item);
                }
            }

            order.setItems(orderItems); // The setter handles the bi-directional relationship

            orderRepository.save(order);

            return ResponseEntity.ok(Map.of("success", true, "orderId", order.getOrderId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Server error processing order"));
        }
    }
}
