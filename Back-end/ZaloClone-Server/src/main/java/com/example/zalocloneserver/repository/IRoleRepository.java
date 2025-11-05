package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.constants.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IRoleRepository extends JpaRepository<Role, Long> {

}
