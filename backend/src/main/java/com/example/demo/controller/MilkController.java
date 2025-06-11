package com.example.demo.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.Milk;
import com.example.demo.entity.User;
import com.example.demo.payload.request.MilkRequest;
import com.example.demo.service.MilkService;
import com.example.demo.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/milk")
public class MilkController {

    @Autowired
    private MilkService milkService;

    @Autowired
    private UserService userService;

    // Get current user's milk data
    @GetMapping("/my-milk")
    public ResponseEntity<Map<String, Object>> getMyMilk() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userService.getUserByUsername(username);
        List<Milk> milkList = milkService.getMilkByUserId(currentUser.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Your milk list retrieved successfully");
        response.put("data", milkList.stream().map(milk -> {
            Map<String, Object> milkData = new HashMap<>();
            milkData.put("id", milk.getId());
            milkData.put("milkType", milk.getMilkType());
            milkData.put("quantity", milk.getQuantity());
            milkData.put("rate", milk.getRate());
            milkData.put("amount", milk.getAmount());
            milkData.put("entryDate", milk.getEntryDate());
            milkData.put("createdAt", milk.getCreatedAt());
            milkData.put("updatedAt", milk.getUpdatedAt());
            milkData.put("userId", milk.getUser().getId());
            milkData.put("user", Map.of(
                    "id", milk.getUser().getId(),
                    "username", milk.getUser().getUsername(),
                    "email", milk.getUser().getEmail()));
            return milkData;
        }).collect(Collectors.toList()));
        return ResponseEntity.ok(response);
    }

    // Get all milk (admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllMilk() {
        List<Milk> milkList = milkService.getAllMilk();
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Milk list retrieved successfully");
        response.put("data", milkList.stream().map(milk -> {
            Map<String, Object> milkData = new HashMap<>();
            milkData.put("id", milk.getId());
            milkData.put("milkType", milk.getMilkType());
            milkData.put("quantity", milk.getQuantity());
            milkData.put("rate", milk.getRate());
            milkData.put("amount", milk.getAmount());
            milkData.put("entryDate", milk.getEntryDate());
            milkData.put("createdAt", milk.getCreatedAt());
            milkData.put("updatedAt", milk.getUpdatedAt());
            milkData.put("userId", milk.getUser().getId());
            milkData.put("user", Map.of(
                    "id", milk.getUser().getId(),
                    "username", milk.getUser().getUsername(),
                    "email", milk.getUser().getEmail()));
            return milkData;
        }).collect(Collectors.toList()));
        return ResponseEntity.ok(response);
    }

    // Get milk by user ID (admin only)
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getMilkByUserId(@PathVariable Long userId) {
        List<Milk> milkList = milkService.getMilkByUserId(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "User's milk list retrieved successfully");
        response.put("data", milkList);
        return ResponseEntity.ok(response);
    }

    // Get all users (for user selection in milk creation)
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Users list retrieved successfully");
        response.put("data", users);
        return ResponseEntity.ok(response);
    }

    // Create new milk with user assignment
    @PostMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createMilk(@Valid @RequestBody MilkRequest milkRequest) {
        Milk milk = new Milk();
        milk.setMilkType(milkRequest.getMilkType());
        milk.setQuantity(milkRequest.getQuantity());
        milk.setRate(milkRequest.getRate());
        milk.setAmount(milkRequest.getAmount());
        milk.setEntryDate(milkRequest.getEntryDate());

        // Get the user by ID and set it
        User user = userService.getUserById(milkRequest.getUserId());
        milk.setUser(user);

        Milk created = milkService.createMilk(milk);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Milk created successfully");
        response.put("data", created);
        return ResponseEntity.ok(response);
    }

    // Get milk by id
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getMilkById(@PathVariable Long id) {
        Milk milk = milkService.getMilkById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Milk retrieved successfully");
        response.put("data", milk);
        return ResponseEntity.ok(response);
    }

    // Get milk by type
    @GetMapping("/type/{milkType}")
    public ResponseEntity<Map<String, Object>> getMilkByType(@PathVariable String milkType) {
        List<Milk> milkList = milkService.getMilkByType(milkType);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Milk list retrieved successfully");
        response.put("data", milkList);
        return ResponseEntity.ok(response);
    }

    // Update milk
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateMilk(@PathVariable Long id,
            @Valid @RequestBody MilkRequest milkRequest) {
        Milk milkDetails = new Milk();
        milkDetails.setMilkType(milkRequest.getMilkType());
        milkDetails.setQuantity(milkRequest.getQuantity());
        milkDetails.setRate(milkRequest.getRate());
        milkDetails.setAmount(milkRequest.getAmount());
        milkDetails.setEntryDate(milkRequest.getEntryDate());

        Milk updated = milkService.updateMilk(id, milkDetails);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Milk updated successfully");
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }

    // Delete milk
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteMilk(@PathVariable Long id) {
        milkService.deleteMilk(id);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Milk deleted successfully");
        return ResponseEntity.ok(response);
    }
}