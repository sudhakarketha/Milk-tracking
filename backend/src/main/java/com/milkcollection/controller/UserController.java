// package com.milkcollection.controller;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;

// import com.example.demo.service.UserService;

// import java.util.HashMap;
// import java.util.Map;

// @RestController
// @RequestMapping("/api/users")
// @CrossOrigin(origins = "*")
// public class UserController {

//     @Autowired
//     private UserService userService;

//     @GetMapping("/count")
//     @PreAuthorize("hasRole('ADMIN')")
//     public ResponseEntity<Map<String, Long>> getTotalUsers() {
//         long count = userService.getTotalUsers();
//         Map<String, Long> response = new HashMap<>();
//         response.put("count", count);
//         return ResponseEntity.ok(response);
//     }
// }