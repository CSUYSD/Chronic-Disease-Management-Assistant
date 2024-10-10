package com.example.demo.model.Security;

import com.example.demo.model.UserImpl.Patient;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

@Getter
@Setter
public class UserDetail extends User {
    private Patient patient;

    // 修改构造函数，接受单个 GrantedAuthority
    public UserDetail(Patient user, Collection<? extends GrantedAuthority> authorities) {
        super(user.getUsername(), user.getPassword(), authorities);
        this.patient = user;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }
}
