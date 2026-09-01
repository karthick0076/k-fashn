package com.kfashn.controller;

import com.kfashn.entity.Product;
import com.kfashn.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import com.kfashn.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Page<Product> productPage = productRepository.findAllByOrderByCreatedAtDesc(
            org.springframework.data.domain.PageRequest.of(page, size)
        );
        return ResponseEntity.ok(productPage.getContent());
    }

    @PostMapping
    public ResponseEntity<?> addProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("category") String category,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setCategory(category);

        if (image != null && !image.isEmpty()) {
            try {
                if (cloudinaryService.isConfigured()) {
                    String url = cloudinaryService.uploadImage(image);
                    product.setImageUrl(url);
                } else {
                    Path uploadPath = Paths.get(uploadDir);
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }

                    String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                    Path filePath = uploadPath.resolve(filename);
                    Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                    
                    product.setImageUrl("/uploads/" + filename);
                }
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Could not upload image: " + e.getMessage());
            }
        }

        Product savedProduct = productRepository.save(product);
        return ResponseEntity.ok(savedProduct);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("category") String category,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        java.util.Optional<Product> optionalProduct = productRepository.findById(id);
        if (!optionalProduct.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Product product = optionalProduct.get();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setCategory(category);

        if (image != null && !image.isEmpty()) {
            try {
                if (cloudinaryService.isConfigured()) {
                    String url = cloudinaryService.uploadImage(image);
                    product.setImageUrl(url);
                } else {
                    Path uploadPath = Paths.get(uploadDir);
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }

                    String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                    Path filePath = uploadPath.resolve(filename);
                    Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                    
                    product.setImageUrl("/uploads/" + filename);
                }
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Could not upload image: " + e.getMessage());
            }
        }

        Product savedProduct = productRepository.save(product);
        return ResponseEntity.ok(savedProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Product deleted"));
        }
        return ResponseEntity.notFound().build();
    }
}
