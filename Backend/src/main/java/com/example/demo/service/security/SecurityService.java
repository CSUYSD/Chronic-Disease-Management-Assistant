package com.example.demo.service.security;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import com.example.demo.Dao.CompanionDao;
import com.example.demo.model.User;
import com.example.demo.model.UserImpl.Companion;
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

import com.example.demo.Dao.PatientDao;
import com.example.demo.Dao.UserRoleDao;
import com.example.demo.exception.PasswordNotCorrectException;
import com.example.demo.exception.UserAlreadyExistsException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.dto.UserDTO;
import com.example.demo.model.Redis.RedisAccount;
import com.example.demo.model.Redis.RedisUser;
import com.example.demo.model.Security.UserDetail;
import com.example.demo.model.UserImpl.Patient;
import com.example.demo.model.UserRole;
import com.example.demo.utility.jwt.JwtUtil;
import com.example.demo.model.Security.LoginVo;

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

    @Autowired
    public SecurityService(PasswordEncoder passwordEncoder, PatientDao patientDao, AuthenticationManager authenticationManager, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate, UserRoleDao userRoleDao, CompanionDao companionDao, PatientDao userDao) {
        this.passwordEncoder = passwordEncoder;
        this.patientDao = patientDao;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        this.userRoleDao = userRoleDao;
        this.companionDao = companionDao;
        this.userDao = userDao;
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
            patientDao.save((Patient) user);
        } else {
            companionDao.save((Companion) user);
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

            // **保存登录成功信息
            Map<String, Object> response = new HashMap<>();
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
        String userAccountsKey = "login_user:" + patient.getId() + ":account:" + "initial placeholder";
        if (accounts.isEmpty()) {
            redisTemplate.opsForValue().set(userAccountsKey, new ArrayList<>(), 1, TimeUnit.HOURS);
        } else {
            List<Long> accountIds = accounts.stream().map(Account::getId).collect(Collectors.toList());
            redisTemplate.opsForValue().set(userAccountsKey, accountIds, 1, TimeUnit.HOURS);

            for (Account account : accounts) {
                String redisAccountKey = "login_user:" + patient.getId() + ":account:" + account.getId();
                RedisAccount redisAccount = new RedisAccount(
                        account.getId(),
                        account.getAccountName(),
                        account.getTotalIncome(),
                        account.getTotalExpense(),
                        account.getHealthRecords()
                );
                redisTemplate.opsForValue().set(redisAccountKey, redisAccount, 1, TimeUnit.HOURS);
            }
        }
    }

    private void storeUserInRedis(User user, String token) {
        RedisUser redisUser = new RedisUser(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatar(),
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