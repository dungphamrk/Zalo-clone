package com.example.zalocloneserver.services.impl;

import com.example.zalocloneserver.dto.req.friend.FriendRequestDTO;
import com.example.zalocloneserver.dto.res.friend.FriendRequestResponse;
import com.example.zalocloneserver.dto.res.friend.FriendResponse;
import com.example.zalocloneserver.model.entity.Friend;
import com.example.zalocloneserver.model.entity.FriendRequest;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.IFriendRepository;
import com.example.zalocloneserver.repository.IFriendRequestRepository;
import com.example.zalocloneserver.repository.IUserRepository;
import com.example.zalocloneserver.services.IFriendService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FriendService implements IFriendService {
    @Autowired
    private IFriendRepository friendRepository;
    @Autowired
    private IFriendRequestRepository friendRequestRepository;
    @Autowired
    private IUserRepository userRepository;
    @Override
    public FriendRequest sendFriendRequest(FriendRequestDTO friendRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        FriendRequest friendRequestEntity = new FriendRequest();
        friendRequestEntity.setMessage(friendRequest.getMessage());
        friendRequestEntity.setCreatedAt(LocalDateTime.now());
        friendRequestEntity.setFromUser(currentUser);
        friendRequestEntity.setToUser(userRepository.findById(friendRequest.getToUserId()).orElseThrow(() -> new RuntimeException("ToUser not found!")));
        return friendRequestRepository.save(friendRequestEntity);
    }

    @Override
    public Friend respondToFriendRequest(Long requestId, boolean isAccepted) {
        FriendRequest friendRequest = friendRequestRepository.findById(requestId).orElseThrow(() -> new RuntimeException("Request not found!"));
        friendRequestRepository.deleteById(requestId);
        if (isAccepted) {
            Friend friend = new Friend();
            friend.setSince(LocalDateTime.now());
            friend.setUser(friendRequest.getToUser());
            friend.setFriend(friendRequest.getFromUser());
            friendRepository.save(friend);
            return friend;
        } else {
            // thêm notification từ chối
            return null;
        }
    }

    @Override
    public Page<FriendResponse> getFriends(Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lấy danh sách bạn bè dạng Page<User>
        Page<User> friendsPage = friendRepository.findFriendsByUserId(currentUser.getId(), pageable);

        return friendsPage.map(friend -> FriendResponse.builder()
                .friendId(friend.getId())
                .friendName(friend.getDisplayName())
                .avatarUrl(friend.getProfile().getAvatarUrl())
                .since(null) // Nếu bạn có trường “since” trong entity Friend thì map nó ở đây
                .build());
    }

    @Override
    public Page<FriendRequestResponse> getFriendRequests(Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Long currentUserId = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();

        // Lấy danh sách yêu cầu kết bạn
        Page<FriendRequest> requestsPage = friendRequestRepository.findByToUserId(currentUserId, pageable);

        // Map sang DTO FriendRequestResponse
        return requestsPage.map(request -> FriendRequestResponse.builder()
                .id(request.getId())
                .fromUserId(request.getFromUser().getId())
                .fromUserName(request.getFromUser().getDisplayName())
                .message(request.getMessage())
                .createdAt(request.getCreatedAt())
                .build());
    }

    @Override
    @Transactional
    public void unfriend(Long friendId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getId().equals(friendId)) {
            throw new RuntimeException("Không thể hủy kết bạn với chính bạn");
        }

        // Kiểm tra user friendId tồn tại
        User other = userRepository.findById(friendId)
                .orElseThrow(() -> new RuntimeException("User bạn muốn hủy không tồn tại"));

        // Lấy tất cả records giữa 2 user (2 chiều)
        List<Friend> relations = friendRepository.findAllBetweenUsers(currentUser.getId(), friendId);

        if (relations == null || relations.isEmpty()) {
            throw new RuntimeException("Hai người không phải là bạn bè");
        }

        // Xóa tất cả records liên quan
        friendRepository.deleteAll(relations);
    }
}
