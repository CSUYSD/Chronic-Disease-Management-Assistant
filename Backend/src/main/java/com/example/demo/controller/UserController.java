package com.example.demo.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.example.demo.model.User;
import com.example.demo.model.dto.PatientDTO;
import com.example.demo.model.userimpl.Companion;
import com.example.demo.service.CompanionService;
import com.example.demo.service.PatientService;
import com.example.demo.utility.GetCurrentUserInfo;
import com.example.demo.utility.jwt.JwtUtil;
import org.hibernate.validator.constraints.URL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.dto.UserDTO;
import com.example.demo.model.userimpl.Patient;
import com.example.demo.service.UserService;
import com.example.demo.utility.RabbitMQProducer;

@RestController
@RequestMapping("/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final CompanionService companionService;
    private final PatientService patientService;
    private final GetCurrentUserInfo getCurrentUserInfo;

    @Autowired
    public UserController(UserService userService, CompanionService companionService, PatientService patientService, GetCurrentUserInfo getCurrentUserInfo) {
        this.userService = userService;
        this.companionService = companionService;
        this.patientService = patientService;
        this.getCurrentUserInfo = getCurrentUserInfo;
    }

    @Autowired
    private RabbitMQProducer rabbitMQProducer;

    @GetMapping("/allusers")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        if (!users.isEmpty()) {
            return ResponseEntity.ok(users);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> userOptional = userService.findById(id);
        return userOptional.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> userOptional = userService.findByUsername(username);
        return userOptional.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/update/userinfo")
    public ResponseEntity<String> updateUser(@RequestHeader("Authorization") String token, @RequestBody UserDTO userDTO) {
        try {
            userService.updateUser(token, userDTO);
            return ResponseEntity.ok("User updated successfully");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating user: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating user: " + e.getMessage());
        }
    }


    @DeleteMapping("delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.status(HttpStatus.OK).body("User deleted successfully");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (DataIntegrityViolationException e) {
            logger.error("Error deleting user: ", e);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error deleting user: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error deleting user: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred: " + e.getMessage());
        }
    }


    @GetMapping("/info")
    public ResponseEntity<UserDTO> getCurrentUserInfo(@RequestHeader("Authorization") String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        UserDTO user_info = userService.getUserInfoByUserId(token).orElse(null);
        if (user_info == null ) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(user_info);
    }

    // Update avatar
    @PatchMapping("/updateAvatar")
    public ResponseEntity<String> updateAvatar(@RequestHeader("Authorization") String token, @URL String avatar) {
        try {
            userService.updateAvatar(token, avatar);
            return ResponseEntity.ok("Avatar updated successfully");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating avatar: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating avatar: " + e.getMessage());
        }
    }



    @GetMapping("/randomString")
    public ResponseEntity<String> getRandomString(@RequestHeader("Authorization") String token) {
        try {
            Long patientId = getCurrentUserInfo.getCurrentUserId(token);
            String randomString = patientService.getRandomStringById(patientId); // 调用 PatientService 获取 randomString
            return ResponseEntity.ok(randomString);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("获取 randomString 过程中发生错误: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("获取 randomString 过程中发生错误");
        }
    }



}