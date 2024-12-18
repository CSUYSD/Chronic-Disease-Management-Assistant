package com.example.demo.controller.security;

import java.util.Map;

import com.example.demo.exception.PasswordNotCorrectException;
import com.example.demo.model.security.LoginVo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.demo.exception.UserAlreadyExistsException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.dto.UserDTO;
import com.example.demo.service.security.SecurityService;
import com.example.demo.service.security.UserDetailService;


import jakarta.validation.Valid;

@Validated
@RestController
public class SecurityController {

    private static final Logger logger = LoggerFactory.getLogger(SecurityController.class);
    private final SecurityService securityService;
    private final UserDetailService userDetailService;
    @Autowired
    public SecurityController(SecurityService securityService, AuthenticationManager authenticationManager, UserDetailService userDetailService) {
        this.securityService = securityService;
        this.userDetailService = userDetailService;
    }
    // 登录
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginVo loginVo) {
        logger.info("收到登录请求: {}", loginVo.getUsername());
        return securityService.login(loginVo);
    }

    // 注册
    @PostMapping("/signup")
    public ResponseEntity<String> createUser(@Valid @RequestBody UserDTO userDTO, @RequestParam String role) {
        try {
            securityService.saveUser(userDTO, role);
            return ResponseEntity.status(HttpStatus.CREATED).body("User successfully created");
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error saving user: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error occurred while saving user");
        }
    }

    //update password
    @PatchMapping("/updatePwd")
    public ResponseEntity<String> updatePassword(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> oldAndNewPwd) {
        try {
            securityService.updatePassword(token, oldAndNewPwd);
            return ResponseEntity.ok("Password updated successfully");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (PasswordNotCorrectException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}