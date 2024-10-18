package com.example.demo.Dao;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.userimpl.Companion;

public interface CompanionDao extends JpaRepository<Companion, Long> {
    public Optional<Companion> findByUsername(String username);
}