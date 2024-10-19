package com.example.demo.model.redis;

import java.io.Serializable;
import java.time.LocalDate;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RedisUser implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long userId;
    private String username;
    private String email;
    private String phone;
    private String avatar;
    private LocalDate dob;  // 新增字段
    private String role;    // 新增字段
    private String token;
    private Long loginTime;
    private Long expireTime;

    public RedisUser(Long userId, String username, String email, String phone, String avatar, LocalDate dob, String role, String token) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.avatar = avatar;
        this.dob = dob;
        this.role = role;
        this.token = token;
        this.loginTime = System.currentTimeMillis();
        this.expireTime = this.loginTime + 24 * 60 * 60 * 1000; // 设置过期时间为24小时
    }
}