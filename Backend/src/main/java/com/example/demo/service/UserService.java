package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.Dao.PatientDao;
import com.example.demo.Dao.UserDao;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.dto.UserDTO;
import com.example.demo.model.RedisAccount;
import com.example.demo.model.Redis.RedisUser;
import com.example.demo.model.User;
import com.example.demo.model.UserImpl.Patient;
import com.example.demo.utility.jwt.JwtUtil;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserDao userDao;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    private final PasswordEncoder passwordEncoder;
    private final PatientDao patientDao;

    @Autowired
    public UserService(PatientDao patientDao, UserDao userDao, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate, PasswordEncoder passwordEncoder) {
        this.userDao = userDao;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        this.passwordEncoder = passwordEncoder;
        this.patientDao = patientDao;
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

    public void updateUser(Long id, Patient updatedUser) throws UserNotFoundException {
        Optional<User> existingUserOptional = userDao.findById(id);

        if (!existingUserOptional.isPresent()) {
            throw new UserNotFoundException("User not found");
        }

        User existingUser = existingUserOptional.get();
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPhone(updatedUser.getPhone());


        // 如果密码不为空，进行加密处理
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            String encodedPassword = passwordEncoder.encode(updatedUser.getPassword());
            existingUser.setPassword(encodedPassword);
        }


        userDao.save(existingUser);
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
        userDTO.setRole(user.getRole().getRoleName());
        List<Account> accounts = user.getAccounts();
        for (Account account : accounts) {
            userDTO.getAccountName().add(account.getAccountName());
        }
        return userDTO;
    }
}