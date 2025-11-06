package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.entity.FriendRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;


@Repository
public interface IFriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    @Query(value = "SELECT fr FROM FriendRequest fr " +
            "JOIN FETCH fr.fromUser fu " +
            "JOIN FETCH fr.toUser tu " +
            "WHERE fr.toUser.id = :userId " +
            "ORDER BY fr.createdAt DESC",
            countQuery = "SELECT COUNT(fr) FROM FriendRequest fr WHERE fr.toUser.id = :userId")
    Page<FriendRequest> findByToUserId(@Param("userId") Long userId, Pageable pageable);

    @Query(value = "SELECT fr FROM FriendRequest fr " +
            "JOIN FETCH fr.fromUser fu " +
            "JOIN FETCH fr.toUser tu " +
            "WHERE fr.fromUser.id = :userId " +
            "ORDER BY fr.createdAt DESC",
            countQuery = "SELECT COUNT(fr) FROM FriendRequest fr WHERE fr.fromUser.id = :userId")
    Page<FriendRequest> findByFromUserId(@Param("userId") Long userId, Pageable pageable);


}
