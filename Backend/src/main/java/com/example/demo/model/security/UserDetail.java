package com.example.demo.model.security;


import com.example.demo.model.User;
import com.example.demo.model.userimpl.Companion;
import com.example.demo.model.userimpl.Patient;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;


import java.util.Collection;

@Getter
@Setter
public class UserDetail extends org.springframework.security.core.userdetails.User {
    private Patient patient;
    private Companion companion;
    @Getter
    private User user;

    // 修改构造函数，接受单个 GrantedAuthority
    public UserDetail(com.example.demo.model.User user, Collection<? extends GrantedAuthority> authorities) {
        super(user.getUsername(), user.getPassword(), authorities);
        this.user = user;  // 保存自定义的 User 对象

        if (user instanceof Patient) {
            this.patient = (Patient) user;
        } else if (user instanceof Companion) {
            this.companion = (Companion) user;
        }
    }
}
