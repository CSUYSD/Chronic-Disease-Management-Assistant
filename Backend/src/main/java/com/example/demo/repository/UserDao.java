package com.example.demo.repository;

import java.util.Optional;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserDao extends JpaRepository<User, Long> {
    public Optional<User> findByUsername(String username);
}
