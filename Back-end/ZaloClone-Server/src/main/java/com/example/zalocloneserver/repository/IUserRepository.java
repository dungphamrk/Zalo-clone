package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findById(Long id);
    List<User> findByUsernameIgnoreCase(String username);

    List<User> findByIdInAndUsernameContainingIgnoreCase(List<Long> ids, String keyword);

    List<User> findByIdNotInAndUsernameIgnoreCase(List<Long> excludedIds, String keyword);


    Page<User> findByUsernameContainingIgnoreCaseAndIdNot(String username, Long idNot, Pageable pageable);
    List<User> findByUsernameContainingIgnoreCaseOrProfileDisplayNameContainingIgnoreCase(String username, String displayName);
}
