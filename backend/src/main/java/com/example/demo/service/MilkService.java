package com.example.demo.service;

import com.example.demo.entity.Milk;
import com.example.demo.entity.User;
import com.example.demo.repository.MilkRepository;
import com.example.demo.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MilkService {

    @Autowired
    private MilkRepository milkRepository;

    @Autowired
    private UserRepository userRepository;

    // Create
    public Milk createMilk(Milk milk) {
        // Calculate amount if not set
        if (milk.getAmount() == null && milk.getRate() != null && milk.getQuantity() != null) {
            milk.setAmount(milk.getRate() * milk.getQuantity());
        }
        // Set entry date if not set
        if (milk.getEntryDate() == null) {
            milk.setEntryDate(LocalDateTime.now());
        }
        return milkRepository.save(milk);
    }

    // Read
    public List<Milk> getAllMilk() {
        // If user is admin, return all milk entries
        // If user is not admin, return only their milk entries
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (currentUser.getRoles().stream().anyMatch(role -> role.getName().name().equals("ROLE_ADMIN"))) {
            return milkRepository.findAll();
        } else {
            return milkRepository.findByUser(currentUser);
        }
    }

    public List<Milk> getMilkByUserId(Long userId) {
        return milkRepository.findByUserId(userId);
    }

    public Milk getMilkById(Long id) {
        Milk milk = milkRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Milk not found with id: " + id));

        // Check if user has access to this milk entry
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!currentUser.getRoles().stream().anyMatch(role -> role.getName().name().equals("ROLE_ADMIN"))
                && !milk.getUser().getId().equals(currentUser.getId())) {
            throw new EntityNotFoundException("Milk not found with id: " + id);
        }

        return milk;
    }

    public List<Milk> getMilkByType(String milkType) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (currentUser.getRoles().stream().anyMatch(role -> role.getName().name().equals("ROLE_ADMIN"))) {
            return milkRepository.findByMilkType(milkType);
        } else {
            return milkRepository.findByMilkType(milkType).stream()
                    .filter(milk -> milk.getUser().getId().equals(currentUser.getId()))
                    .toList();
        }
    }

    // Update
    @Transactional
    public Milk updateMilk(Long id, Milk milkDetails) {
        Milk milk = getMilkById(id); // This will check permissions

        milk.setMilkType(milkDetails.getMilkType());
        milk.setQuantity(milkDetails.getQuantity());
        milk.setRate(milkDetails.getRate());
        milk.setAmount(milkDetails.getRate() * milkDetails.getQuantity());
        milk.setEntryDate(milkDetails.getEntryDate());

        return milkRepository.save(milk);
    }

    // Delete
    public void deleteMilk(Long id) {
        Milk milk = getMilkById(id); // This will check permissions
        milkRepository.deleteById(id);
    }
}