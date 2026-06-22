package com.CGL.cgl.Service;

import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.UserRepo;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepo userRepo;

    public CustomUserDetailsService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
        throws UsernameNotFoundException {
        Users user = userRepo
            .findByEmail(email)
            .orElseThrow(() ->
                new UsernameNotFoundException("Email not found: " + email)
            );
        if (
            !user.isEmailVerified() &&
            user.getRole() != com.CGL.cgl.Model.Role.SUPER_ADMIN
        ) {
            throw new UsernameNotFoundException(
                "Please verify your email before logging in"
            );
        }

        return org.springframework.security.core.userdetails.User.withUsername(
            user.getEmail()
        )
            .password(user.getPassword())
            .authorities("ROLE_" + user.getRole().name())
            .build();
    }
}
