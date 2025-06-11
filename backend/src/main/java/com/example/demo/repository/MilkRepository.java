package com.example.demo.repository;

import com.example.demo.entity.Milk;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MilkRepository extends JpaRepository<Milk, Long> {
    List<Milk> findByMilkType(String milkType);

    List<Milk> findByUser(User user);

    List<Milk> findByUserId(Long userId);

    List<Milk> findByEntryDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}