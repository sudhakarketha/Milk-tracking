package com.example.demo.payload.response;

import lombok.Data;
import com.example.demo.entity.Role;

import java.util.List;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private List<Role> roles;

    public JwtResponse(String accessToken, Long id, String username, String email, List<Role> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }
}