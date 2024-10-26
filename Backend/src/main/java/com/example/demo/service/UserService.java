package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import com.example.demo.model.userimpl.Companion;
import com.example.demo.repository.CompanionDao;
import com.example.demo.utility.GetCurrentUserInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.repository.PatientDao;
import com.example.demo.repository.UserDao;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.dto.UserDTO;
import com.example.demo.model.RedisAccount;
import com.example.demo.model.redis.RedisUser;
import com.example.demo.model.User;
import com.example.demo.model.userimpl.Patient;
import com.example.demo.utility.jwt.JwtUtil;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserDao userDao;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final PasswordEncoder passwordEncoder;
    private final PatientDao patientDao;
    private final CompanionDao companionDao;
    private final GetCurrentUserInfo getCurrentUserInfo;

    @Autowired
    public UserService(PatientDao patientDao, UserDao userDao, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate, PasswordEncoder passwordEncoder, CompanionDao companionDao, GetCurrentUserInfo getCurrentUserInfo) {
        this.userDao = userDao;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        this.passwordEncoder = passwordEncoder;
        this.patientDao = patientDao;
        this.companionDao = companionDao;
        this.getCurrentUserInfo = getCurrentUserInfo;
    }

    public List<User> findAll() {
        return userDao.findAll();
    }

    public Optional<User> findById(Long id) {
        return userDao.findById(id);
    }

    public Optional<User> findByUsername(String username) {
        return userDao.findByUsername(username);
    }

    public void updateUser(String token, UserDTO userDTO) throws UserNotFoundException {
        Long userId = getCurrentUserInfo.getCurrentUserId(token);
        Optional<User> existingUserOptional = userDao.findById(userId);

        if (existingUserOptional.isEmpty()) {
            throw new UserNotFoundException("User not found");
        }

        User existingUser = existingUserOptional.get();
        existingUser.setUsername(userDTO.getUsername());
        existingUser.setEmail(userDTO.getEmail());
        existingUser.setPhone(userDTO.getPhone());
        existingUser.setDob(userDTO.getDob());
        // update user info in database
        userDao.save(existingUser);

        String redisUserKey = "login_user:" + userId + ":info";
        RedisUser redisUser = (RedisUser) redisTemplate.opsForValue().get(redisUserKey);
    
        if (redisUser != null) {
            // update user info in redis
            RedisUser updatedRedisUser = new RedisUser(
                redisUser.getUserId(),
                userDTO.getUsername(),
                userDTO.getEmail(),
                userDTO.getPhone(),
                redisUser.getAvatar(),
                userDTO.getDob(),
                redisUser.getRole(),
                redisUser.getToken()
            );
            
            // save update user info into redis with same login session
            Long ttl = redisTemplate.getExpire(redisUserKey);
            if (ttl > 0) {
                redisTemplate.opsForValue().set(redisUserKey, updatedRedisUser, ttl, TimeUnit.SECONDS);
            } else {
                redisTemplate.opsForValue().set(redisUserKey, updatedRedisUser, 1, TimeUnit.HOURS);
            }
    }
    }

    public void deleteUser(Long id) throws UserNotFoundException, DataIntegrityViolationException {
        Optional<User> userOptional = userDao.findById(id);

        if (!userOptional.isPresent()) {
            throw new UserNotFoundException("User not found");
        }

        userDao.deleteById(id);
    }

    public void updateAvatar(String token, String avatar) throws UserNotFoundException {
        token = token.replace("Bearer ", "");
        Long userId = jwtUtil.getUserIdFromToken(token);
        Optional<User> userOptional = userDao.findById(userId);

        if (!userOptional.isPresent()) {
            throw new UserNotFoundException("User not found");
        }
        
        User user = userOptional.get();
        user.setAvatar(avatar);
        userDao.save(user);
    }


    @Transactional(readOnly = true)
    public Optional<UserDTO> getUserInfoByUserId(String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtUtil.getUserIdFromToken(token);
        String userRedisKey = "login_user:" + userId + ":info";


        RedisUser redisUser = (RedisUser) redisTemplate.opsForValue().get(userRedisKey);


        // 如果 Redis 中有用户信息，直接返回
        if (redisUser != null) {
            return Optional.of(getUserInfoFromRedis(redisUser, userId));
        } else {
            // 如果 Redis 中没有用户信息，从数据库中获取
            return patientDao.findById(userId)
                    .map(this::convertToDTO);
        }
    }

    private UserDTO getUserInfoFromRedis(RedisUser redisUser, Long userId) {
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(redisUser.getUsername());
        userDTO.setEmail(redisUser.getEmail());
        userDTO.setPhone(redisUser.getPhone());
        userDTO.setAvatar(redisUser.getAvatar());
        userDTO.setDob(redisUser.getDob());
        userDTO.setRole(redisUser.getRole().replaceFirst("ROLE_", "").toLowerCase());

        List<String> accountNames = new ArrayList<>();
        String keyPattern = "login_user:" + userId + ":account*";
        Set<String> accountKeys = redisTemplate.keys(keyPattern);
        for (String key : accountKeys){
            if (key.equals("login_user:" + userId + ":account:initial placeholder")){
                continue;
            }
            String accountName = ((RedisAccount) redisTemplate.opsForValue().get(key)).getName();
            accountNames.add(accountName);
        }
        userDTO.setAccountName(accountNames);
        return userDTO;
    }

    private UserDTO convertToDTO(Patient user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhone(user.getPhone());
        userDTO.setAvatar(user.getAvatar());
        userDTO.setDob(user.getDob());
        userDTO.setRole(user.getRole().getRoleName().replaceFirst("ROLE_", "").toLowerCase());
        List<Account> accounts = user.getAccounts();
        for (Account account : accounts) {
            userDTO.getAccountName().add(account.getAccountName());
        }
        return userDTO;
    }
}