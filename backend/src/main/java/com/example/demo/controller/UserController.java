package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.payload.request.PasswordChangeRequest;
import com.example.demo.payload.request.UserUpdateRequest;
import com.example.demo.payload.response.MessageResponse;
import com.example.demo.payload.response.UserResponse;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Get all users (Admin only)
    @GetMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers().stream()
                .map(user -> new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getPhoneNumber(),
                        user.getRoles()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // Get user by ID (Admin or same user)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.getUserById(#id).username == authentication.principal.username")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(new UserResponse(user.getId(), user.getUsername(), user.getEmail(),
                user.getPhoneNumber(), user.getRoles()));
    }

    // Update user (Admin or same user)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.getUserById(#id).username == authentication.principal.username")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest updateRequest) {
        // Check if username is taken by another user
        if (updateRequest.getUsername() != null &&
                userService.existsByUsername(updateRequest.getUsername()) &&
                !userService.getUserById(id).getUsername().equals(updateRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        // Check if email is taken by another user
        if (updateRequest.getEmail() != null &&
                userService.existsByEmail(updateRequest.getEmail()) &&
                !userService.getUserById(id).getEmail().equals(updateRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        User userDetails = new User();
        userDetails.setUsername(updateRequest.getUsername());
        userDetails.setEmail(updateRequest.getEmail());
        userDetails.setPassword(updateRequest.getPassword());
        userDetails.setPhoneNumber(updateRequest.getPhoneNumber());

        User updatedUser = userService.updateUser(id, userDetails);
        return ResponseEntity.ok(new UserResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getPhoneNumber(),
                updatedUser.getRoles()));
    }

    // Change password
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody PasswordChangeRequest passwordChangeRequest) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Verify that new password and confirm password match
        if (!passwordChangeRequest.getNewPassword().equals(passwordChangeRequest.getConfirmPassword())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: New password and confirm password do not match!"));
        }

        try {
            userService.changePassword(
                    userDetails.getUsername(),
                    passwordChangeRequest.getCurrentPassword(),
                    passwordChangeRequest.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Password changed successfully!"));
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Current password is incorrect!"));
        }
    }

    // Delete user (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
    }

    // Get current user's profile
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userService.getUserByUsername(userDetails.getUsername());
        return ResponseEntity.ok(new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRoles()));
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getTotalUsers() {
        long count = userService.getTotalUsers();
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}