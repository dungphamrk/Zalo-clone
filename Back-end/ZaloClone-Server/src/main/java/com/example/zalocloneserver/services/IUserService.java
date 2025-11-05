package com.example.zalocloneserver.services;

import com.example.zalocloneserver.model.entity.User;
import org.springframework.stereotype.Service;

@Service
public interface IUserService {
    User createUser(UserRequest user);
}
