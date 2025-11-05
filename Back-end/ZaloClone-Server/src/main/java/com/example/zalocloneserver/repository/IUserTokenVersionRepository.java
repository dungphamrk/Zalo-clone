package com.example.zalocloneserver.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.example.zalocloneserver.model.entity.UserTokenVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IUserTokenVersionRepository  extends JpaRepository<UserTokenVersion, String> {
}
