package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.entity.Friend;
import com.example.zalocloneserver.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IFriendRepository extends JpaRepository<Friend, Long> {

    Optional<Friend> findByUserIdAndFriendId(Long userId, Long friendId);
    Optional<Friend> findById(Long id);

    @EntityGraph(attributePaths = {"user", "user.profile", "friend", "friend.profile"})
    Page<Friend> findByUser_Id(Long userId, Pageable pageable);
    default Page<Friend> findByUserId(Long userId, Pageable pageable) {
        return findByUser_Id(userId, pageable);
    }

    // 2. Kiểm tra mối quan hệ 1 chiều (Cần thiết cho sendFriendRequest)
    boolean existsByUserIdAndFriendId(Long userId, Long friendId);

    // 3. Tìm mối quan hệ hai chiều (Cần thiết cho unfriend)
    @Query("SELECT f FROM Friend f " +
            "WHERE (f.user.id = :userId1 AND f.friend.id = :userId2) " +
            "OR (f.user.id = :userId2 AND f.friend.id = :userId1)")
    List<Friend> findAllBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);


    @Query("SELECT f FROM Friend f WHERE f.user.id = :userId OR f.friend.id = :userId")
    List<Friend> findFriendsByUserId(@Param("userId") Long userId);

}
