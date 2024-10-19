package com.example.demo.model;

import com.example.demo.model.security.UserRole;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor  // JPA要求实体类具有无参构造函数
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "users")  // 避免使用保留字
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;
    @Column(nullable = false)
    @NotBlank
    private String password;
    @Column(nullable = false)
    @NotBlank
    private String email;
    private String phone;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = LocalDateSerializer.class)
    private LocalDate dob;
    private String avatar;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private UserRole role;

    public UserRole getRole() {
        return role;
    }
}
