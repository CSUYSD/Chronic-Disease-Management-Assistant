package com.example.demo.Dao;

import java.util.Optional;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDao extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
