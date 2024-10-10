package com.example.demo.service.Security;

import com.example.demo.model.User;
import com.example.demo.utility.JWT.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.example.demo.Dao.PatientDao;
import com.example.demo.Dao.UserDao;
import com.example.demo.model.UserImpl.Patient;
import com.example.demo.model.Security.UserDetail;
import com.example.demo.model.UserRole;

import java.util.Collection;
import java.util.Collections;

@Service
public class UserDetailService implements UserDetailsService {
    @Autowired
    private final UserDao userDao;

    public UserDetailService(UserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userDao.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return createUserDetails(user);
    }

    public UserDetails loadUserById(Long id) throws UsernameNotFoundException {
        User user = userDao.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return createUserDetails(user);
    }

    private UserDetails createUserDetails(User user) {
        UserRole userRole = user.getRole();
        Collection<? extends GrantedAuthority> authorities = 
            Collections.singleton(new SimpleGrantedAuthority(userRole.getRoleName()));
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(), user.getPassword(), authorities);
    }


}