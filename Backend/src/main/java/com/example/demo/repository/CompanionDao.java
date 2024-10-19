package com.example.demo.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.userimpl.Companion;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanionDao extends JpaRepository<Companion, Long> {
    public Optional<Companion> findByUsername(String username);
}