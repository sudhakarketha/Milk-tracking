package com.example.demo.payload.response;

import com.example.demo.entity.Role;
import lombok.Data;

import java.util.Set;

@Data
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String phoneNumber;
    private Set<Role> roles;

    public UserResponse(Long id, String username, String email, Set<Role> roles) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }

    public UserResponse(Long id, String username, String email, String phoneNumber, Set<Role> roles) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.roles = roles;
    }
}