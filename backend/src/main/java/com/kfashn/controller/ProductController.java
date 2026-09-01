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
                String url = null;
                try {
                    if (cloudinaryService.isConfigured()) {
                        url = cloudinaryService.uploadImage(image);
                    }
                } catch (Exception ignored) {
                    // Cloudinary failed (likely bad credentials), fallback to catbox
                }
                
                if (url == null) {
                    url = uploadToCatbox(image);
                }
                product.setImageUrl(url);
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("success", false, "message", "Could not upload image. " + e.getMessage()));
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
                String url = null;
                try {
                    if (cloudinaryService.isConfigured()) {
                        url = cloudinaryService.uploadImage(image);
                    }
                } catch (Exception ignored) {
                }
                
                if (url == null) {
                    url = uploadToCatbox(image);
                }
                product.setImageUrl(url);
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("success", false, "message", "Could not upload image. " + e.getMessage()));
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

    private String uploadToCatbox(MultipartFile file) throws Exception {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);
        
        org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
        body.add("reqtype", "fileupload");
        body.add("fileToUpload", new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
            }
        });
        
        org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(body, headers);
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity("https://catbox.moe/user/api.php", requestEntity, String.class);
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return response.getBody();
        } else {
            throw new Exception("Catbox API returned error: " + response.getStatusCode());
        }
    }
}
