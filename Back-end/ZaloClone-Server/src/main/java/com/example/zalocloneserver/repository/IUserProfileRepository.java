package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IUserProfileRepository  extends JpaRepository<UserProfile, Long> {
}
