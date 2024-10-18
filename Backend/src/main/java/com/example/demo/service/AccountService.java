package com.example.demo.service;

import com.example.demo.Dao.PatientDao;
import com.example.demo.exception.AccountAlreadyExistException;
import com.example.demo.exception.AccountNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.dto.AccountDTO;
import com.example.demo.model.RedisAccount;
import com.example.demo.model.userimpl.Patient;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.Dao.AccountDao;

import java.util.List;
import java.util.Set;

import java.util.stream.Collectors;


import org.springframework.data.redis.core.RedisTemplate;
import com.example.demo.exception.UserNotFoundException;

@Service
@Slf4j
public class AccountService {
    private final PatientDao patientDao;
    private final AccountDao accountDao;

    @Autowired
    @Qualifier("myRedisTemplate")
    private RedisTemplate<String, Object> redisTemplate;
    @Autowired
    private ObjectMapper redisObjectMapper;

    @Autowired
    public AccountService(AccountDao accountDao, PatientDao patientDao) {
        this.accountDao = accountDao;
        this.patientDao = patientDao;
    }

    public List<Account> getAllAccounts() {
        return accountDao.findAll();
    }

    public Account getAccountByAccountId(Long id) throws AccountNotFoundException {
        return accountDao.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("账户未找到，ID: " + id));
    }

    public String createAccount(AccountDTO accountDTO, Long userId) throws UserNotFoundException, AccountAlreadyExistException, AccountNotFoundException {
        String pattern = "login_user:" + userId + ":account*" ;
        Set<String> keys = redisTemplate.keys(pattern);
        System.out.printf("===============================keys: %s\n", keys);

        // 使用一个标志来跟踪是否所有的反序列化都成功完成
        boolean allDeserializationSuccessful = true;

        for (String key : keys) {
            Object rawObject = redisTemplate.opsForValue().get(key);
            try {
                RedisAccount redisAccount;
                if (rawObject instanceof String) {
                    redisAccount = redisObjectMapper.readValue((String) rawObject, RedisAccount.class);
                } else {
                    redisAccount = redisObjectMapper.convertValue(rawObject, RedisAccount.class);
                }
                if (redisAccount.getName().equals(accountDTO.getName())) {
                    throw new AccountAlreadyExistException("账户名已存在");
                }
            } catch (Exception e) {
                if (e instanceof AccountAlreadyExistException) {
                    throw (AccountAlreadyExistException) e;
                }
                log.error("Error deserializing Redis object for key: " + key, e);
                allDeserializationSuccessful = false;
                break; // 如果出现任何反序列化错误，立即退出循环
            }
        }

        // 如果有任何反序列化失败，抛出异常
        if (!allDeserializationSuccessful) {
            throw new RuntimeException("无法验证账户名唯一性，请稍后重试");
        }


        // 获取用户,从token里找到的id
        Patient user = patientDao.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("用户不存在"));

        // 存到PSQL里
        Account newAccount = new Account();
        newAccount.setAccountName(accountDTO.getName());
        newAccount.setPatient(user);
        newAccount.setTotalIncome(0.0);
        newAccount.setTotalExpense(0.0);
        accountDao.save(newAccount);

        // 把这个新account加进用户关联的redis里
        String newAccountKey = "login_user:" + userId + ":account:" + newAccount.getId();
        RedisAccount newRedisAccount =
                new RedisAccount(
                        newAccount.getId(),
                        newAccount.getAccountName(),
                        newAccount.getTotalIncome(),
                        newAccount.getTotalExpense());

        redisTemplate.opsForValue().set(newAccountKey, newRedisAccount);
        return "账户创建成功";
    }



    public Account updateAccount(Long id, AccountDTO accountDTO) throws AccountNotFoundException {
        Account existingAccount = getAccountByAccountId(id);
        Patient user = existingAccount.getPatient();

        List<Account> existingAccounts = accountDao.findByPatient(user)
                .stream()
                .filter(account -> !account.getId().equals(id))  // 排除当前修改的账户
                .collect(Collectors.toList());

        for (Account account : existingAccounts) {
            if (account.getAccountName().equals(accountDTO.getName())) {
                throw new AccountAlreadyExistException("该用户下的账户名已存在");
            }
        }

        // 更新账户名称和余额
        existingAccount.setAccountName(accountDTO.getName());
        existingAccount.setTotalIncome(accountDTO.getTotal_income());
        existingAccount.setTotalExpense(accountDTO.getTotal_expense());

        // 保存并返回更新后的账户信息
        Account updatedAccount = accountDao.save(existingAccount);

        // 更新 Redis 缓存
        updateRedisAccount(existingAccount.getPatient().getId(), existingAccount.getId(), updatedAccount);

        return updatedAccount;
    }


    public void deleteAccount(Long id) throws AccountNotFoundException {
        Account account = getAccountByAccountId(id);

        // 删除数据库中的账户
        accountDao.delete(account);

        // 删除 Redis 中的缓存
        String redisKey = "login_user:" + account.getPatient().getId() + ":account:" + id;
        redisTemplate.delete(redisKey);

    }

    public void setCurrentAccountToRedis(Long accountId, Long userId) {
        String pattern = "login_user:" + userId + ":current_account";
        redisTemplate.opsForValue().set(pattern, accountId);
    }

    public void updateRedisAccount(Long userId, Long accountId, Account account) {
        String redisKey = "login_user:" + userId + ":account:" + accountId;
        RedisAccount redisAccount = new RedisAccount(
                account.getId(),
                account.getAccountName(),
                account.getTotalIncome(),
                account.getTotalExpense());
        redisTemplate.opsForValue().set(redisKey, redisAccount);
    }


}

