const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. Entity: Faq.java
const faqEntity = `package com.primeroute.logistics.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "faqs")
public class Faq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 255)
    private String question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String answer;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Faq() {
    }

    public Faq(String category, String question, String answer, Integer displayOrder, Boolean isActive) {
        this.category = category;
        this.question = question;
        this.answer = answer;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.isActive = isActive != null ? isActive : true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
`;
fs.writeFileSync(path.join(BACKEND_BASE, 'entity', 'Faq.java'), faqEntity, 'utf8');
console.log('Created Faq.java entity');

// 2. Repository: FaqRepository.java
const faqRepo = `package com.primeroute.logistics.repository;

import com.primeroute.logistics.entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {

    List<Faq> findByIsActiveTrueOrderByDisplayOrderAsc();

    List<Faq> findByCategoryIgnoreCaseAndIsActiveTrueOrderByDisplayOrderAsc(String category);

    @Query("SELECT DISTINCT f.category FROM Faq f WHERE f.isActive = true ORDER BY f.category ASC")
    List<String> findDistinctActiveCategories();
}
`;
fs.writeFileSync(path.join(BACKEND_BASE, 'repository', 'FaqRepository.java'), faqRepo, 'utf8');
console.log('Created FaqRepository.java');

// 3. DTO: FaqDTO.java
const faqDTO = `package com.primeroute.logistics.dto;

import com.primeroute.logistics.entity.Faq;

public class FaqDTO {
    private Long id;
    private String category;
    private String q;
    private String a;
    private Integer displayOrder;
    private Boolean isActive;

    public FaqDTO() {}

    public FaqDTO(Faq faq) {
        this.id = faq.getId();
        this.category = faq.getCategory();
        this.q = faq.getQuestion();
        this.a = faq.getAnswer();
        this.displayOrder = faq.getDisplayOrder();
        this.isActive = faq.getIsActive();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getQ() { return q; }
    public void setQ(String q) { this.q = q; }

    public String getA() { return a; }
    public void setA(String a) { this.a = a; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
`;
fs.writeFileSync(path.join(BACKEND_BASE, 'dto', 'FaqDTO.java'), faqDTO, 'utf8');
console.log('Created FaqDTO.java');

// 4. Service: FaqService.java
const faqService = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.FaqDTO;
import com.primeroute.logistics.entity.Faq;
import com.primeroute.logistics.repository.FaqRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FaqService {

    private final FaqRepository faqRepository;

    public FaqService(FaqRepository faqRepository) {
        this.faqRepository = faqRepository;
    }

    @Transactional(readOnly = true)
    public List<FaqDTO> getActiveFaqs(String category) {
        List<Faq> faqs;
        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) {
            faqs = faqRepository.findByCategoryIgnoreCaseAndIsActiveTrueOrderByDisplayOrderAsc(category.trim());
        } else {
            faqs = faqRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        }
        return faqs.stream().map(FaqDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return faqRepository.findDistinctActiveCategories();
    }
}
`;
fs.writeFileSync(path.join(BACKEND_BASE, 'service', 'FaqService.java'), faqService, 'utf8');
console.log('Created FaqService.java');

// 5. Controller: FaqController.java
const faqController = `package com.primeroute.logistics.controller;

import com.primeroute.logistics.dto.ApiResponse;
import com.primeroute.logistics.dto.FaqDTO;
import com.primeroute.logistics.service.FaqService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faqs")
public class FaqController {

    private final FaqService faqService;

    public FaqController(FaqService faqService) {
        this.faqService = faqService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FaqDTO>>> getFaqs(
            @RequestParam(required = false) String category) {
        List<FaqDTO> faqs = faqService.getActiveFaqs(category);
        return ResponseEntity.ok(new ApiResponse<>(true, "FAQs retrieved successfully", faqs));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = faqService.getCategories();
        return ResponseEntity.ok(new ApiResponse<>(true, "Categories retrieved successfully", categories));
    }
}
`;
fs.writeFileSync(path.join(BACKEND_BASE, 'controller', 'FaqController.java'), faqController, 'utf8');
console.log('Created FaqController.java');

// 6. Update SecurityConfig.java to permit /api/faqs/**
const secConfigPath = path.join(BACKEND_BASE, 'config', 'SecurityConfig.java');
let secCode = fs.readFileSync(secConfigPath, 'utf8');

if (!secCode.includes('/api/faqs/**')) {
  secCode = secCode.replace(
    '.requestMatchers("/api/auth/**", "/error")',
    '.requestMatchers("/api/auth/**", "/api/faqs/**", "/error")'
  );
  fs.writeFileSync(secConfigPath, secCode, 'utf8');
  console.log('Updated SecurityConfig.java to permit /api/faqs/**');
} else {
  console.log('SecurityConfig already permits /api/faqs/**');
}
