package com.example.demo.service.security;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import com.example.demo.repository.AccountDao;
import com.example.demo.repository.CompanionDao;
import com.example.demo.model.User;
import com.example.demo.model.userimpl.Companion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.repository.PatientDao;
import com.example.demo.repository.UserRoleDao;
import com.example.demo.exception.PasswordNotCorrectException;
import com.example.demo.exception.UserAlreadyExistsException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.dto.UserDTO;
import com.example.demo.model.RedisAccount;
import com.example.demo.model.redis.RedisUser;
import com.example.demo.model.security.UserDetail;
import com.example.demo.model.userimpl.Patient;
import com.example.demo.model.security.UserRole;
import com.example.demo.utility.jwt.JwtUtil;
import com.example.demo.model.security.LoginVo;

@Service
public class SecurityService {
    private static final Logger logger = LoggerFactory.getLogger(SecurityService.class);
    private final PasswordEncoder passwordEncoder;
    private final PatientDao patientDao;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRoleDao userRoleDao;
    private final CompanionDao companionDao;
    private final PatientDao userDao;
    private final AccountDao accountDao;

    @Autowired
    public SecurityService(PasswordEncoder passwordEncoder, PatientDao patientDao, AuthenticationManager authenticationManager, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate, UserRoleDao userRoleDao, CompanionDao companionDao, PatientDao userDao, AccountDao accountDao) {
        this.passwordEncoder = passwordEncoder;
        this.patientDao = patientDao;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        this.userRoleDao = userRoleDao;
        this.companionDao = companionDao;
        this.userDao = userDao;
        this.accountDao = accountDao;
    }

    @Transactional
    public void saveUser(UserDTO userDTO, String role) {
        if (userDao.findByUsername(userDTO.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("User already exists");
        }

        UserRole userRole = userRoleDao.findByRole("ROLE_" + role.toUpperCase())
                .orElseThrow(() -> new RuntimeException("User role not found"));

        User user;
        if ("PATIENT".equalsIgnoreCase(role)) {
            user = new Patient();
            String randomCode = UUID.randomUUID().toString();
            ((Patient) user).setRandomString(randomCode);
        } else if ("COMPANION".equalsIgnoreCase(role)) {
            user = new Companion();
        } else {
            throw new IllegalArgumentException("Invalid role");
        }

        BeanUtils.copyProperties(userDTO, user);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setRole(userRole);

        if (user instanceof Patient) {
            Patient patient = (Patient) user;
            patientDao.save(patient);

            // Create default accounts for the patient
            createDefaultAccounts(patient);
        } else {
            companionDao.save((Companion) user);
        }
    }

    private void createDefaultAccounts(Patient patient) {
        List<String> defaultAccountNames = Arrays.asList("Hypertension", "Diabetes", "Cardiovascular Disease");

        for (String accountName : defaultAccountNames) {
            Account account = new Account();
            account.setAccountName(accountName);
            account.setPatient(patient);
            accountDao.save(account);

            // Add the new account to Redis
            String newAccountKey = "login_user:" + patient.getId() + ":account:" + account.getId();
            RedisAccount newRedisAccount = new RedisAccount(
                    account.getId(),
                    account.getAccountName());
            redisTemplate.opsForValue().set(newAccountKey, newRedisAccount);
        }
    }

    public ResponseEntity<Map<String, Object>> login(LoginVo loginVo) {
        logger.info("尝试登录用户: {}", loginVo.getUsername());
        try {
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(loginVo.getUsername(), loginVo.getPassword());
            Authentication authentication = authenticationManager.authenticate(authenticationToken);

            UserDetail userDetail = (UserDetail) authentication.getPrincipal();
            User user = userDetail.getUser();

            // **生成token
            String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().getRoleName());

            // **处理 Patient 逻辑
            if ("ROLE_PATIENT".equals(user.getRole().getRoleName())) {
                handlePatientLogin(userDetail, token);
            }

            // **Redis 存储基础信息
            storeUserInRedis(user, token);

            //提取role name
            String role = user.getRole().getRoleName();
            String roleName = role.replaceFirst("ROLE_", "").toLowerCase();

            // **保存登录成功信息
            Map<String, Object> response = new HashMap<>();
            response.put("role", roleName);
            response.put("token", token);
            response.put("username", user.getUsername());

            logger.info("用户 {} 登录成功", loginVo.getUsername());
            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            logger.error("用户 {} 登录失败: {}", loginVo.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "用户名或密码错误"));
        } catch (Exception e) {
            logger.error("登录过程中发生错误: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "登录过程中发生错误"));
        }
    }

    private void handlePatientLogin(UserDetail userDetail, String token) {
        Patient patient = userDetail.getPatient();
        List<Account> accounts = patient.getAccounts();

        // 存储账户信息到 Redis
        List<Long> accountIds = accounts.stream().map(Account::getId).toList();

        for (Account account : accounts) {
            String redisAccountKey = "login_user:" + patient.getId() + ":account:" + account.getId();
            RedisAccount redisAccount = new RedisAccount(
                    account.getId(),
                    account.getAccountName()
            );
            redisTemplate.opsForValue().set(redisAccountKey, redisAccount, 1, TimeUnit.HOURS);
        }
    }

    private void storeUserInRedis(User user, String token) {
        RedisUser redisUser = new RedisUser(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatar(),
                user.getDob(),  // 假设 User 类有 getDob() 方法
                user.getRole().getRoleName(),
                token
        );

        String redisUserKey = "login_user:" + user.getId() + ":info";
        redisTemplate.opsForValue().set(redisUserKey, redisUser, 1, TimeUnit.HOURS);
    }

    // update password
    public void updatePassword(String token, Map<String, String> oldAndNewPwd) throws UserNotFoundException, PasswordNotCorrectException {
        token = token.replace("Bearer ", "");
        Long userId = jwtUtil.getUserIdFromToken(token);
        Patient user = patientDao.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("用户未找到"));

        String oldPassword = oldAndNewPwd.get("oldpassword");
        String newPassword = oldAndNewPwd.get("newpassword");

        // 使用 PasswordEncoder 的 matches 方法验证旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new PasswordNotCorrectException("原密码不正确");
        }

        // 加密新密码
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedNewPassword);
        patientDao.save(user);
    }
}