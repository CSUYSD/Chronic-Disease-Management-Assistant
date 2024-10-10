package com.example.demo.Dao;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.UserImpl.Companion;

public interface CompanionDao extends JpaRepository<Companion, Long> {
    Optional<Companion> findByUsername(String username);
}