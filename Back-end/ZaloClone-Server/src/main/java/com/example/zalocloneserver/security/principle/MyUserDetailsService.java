package com.example.zalocloneserver.security.principle;

import com.example.zalocloneserver.model.constants.Role;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MyUserDetailsService implements UserDetailsService
{
    private final IUserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException
    {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username + " not found"));

        return MyUserDetails.builder()
                .id(user.getId()) // Đảm bảo ID được set
                .user(user)
                .authorities(mapRoleToGrandAuthorities(Collections.singletonList(Role.USER)))
                .build();
    }

    private Collection<? extends GrantedAuthority> mapRoleToGrandAuthorities(List<Role> roles) {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_"+Role.USER.name()))
                .toList();
    }
}
