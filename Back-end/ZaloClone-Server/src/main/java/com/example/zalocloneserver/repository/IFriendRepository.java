package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.entity.Friend;
import com.example.zalocloneserver.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IFriendRepository extends JpaRepository<Friend, Long> {

    @Query(value = "SELECT f.friend FROM Friend f WHERE f.user.id = :userId",
            countQuery = "SELECT COUNT(f) FROM Friend f WHERE f.user.id = :userId")
    Page<User> findFriendsByUserId(@Param("userId") Long userId, Pageable pageable);
    Optional<Friend> findByUserIdAndFriendId(Long userId, Long friendId);

    @Query("SELECT f FROM Friend f WHERE (f.user.id = :userA AND f.friend.id = :userB) OR (f.user.id = :userB AND f.friend.id = :userA)")
    List<Friend> findAllBetweenUsers(@Param("userA") Long userA, @Param("userB") Long userB);
}
