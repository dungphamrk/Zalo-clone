package com.example.zalocloneserver.services.impl;

import com.example.zalocloneserver.dto.req.friend.FriendRequestDTO;
import com.example.zalocloneserver.dto.res.UserSearchResponse;
import com.example.zalocloneserver.dto.res.friend.FriendRequestResponse;
import com.example.zalocloneserver.dto.res.friend.FriendRequestSentResponse;
import com.example.zalocloneserver.dto.res.friend.FriendResponse;
import com.example.zalocloneserver.dto.res.user.UserProfileResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse; // Thêm import này
import com.example.zalocloneserver.model.entity.Friend;
import com.example.zalocloneserver.model.entity.FriendRequest;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.model.entity.UserProfile;
import com.example.zalocloneserver.repository.IFriendRepository;
import com.example.zalocloneserver.repository.IFriendRequestRepository;
import com.example.zalocloneserver.repository.IUserProfileRepository;
import com.example.zalocloneserver.model.constants.NotificationType;
import com.example.zalocloneserver.repository.IUserRepository;
import com.example.zalocloneserver.services.IFriendService;
import com.example.zalocloneserver.services.INotificationService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors; // Thêm import này

@Service
public class FriendService implements IFriendService {
    @Autowired
    private IFriendRepository friendRepository;
    @Autowired
    private IFriendRequestRepository friendRequestRepository;
    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private IUserProfileRepository userProfileRepository;

    @Autowired
    private INotificationService notificationService;
    // --- Phương thức tiện ích để lấy User hiện tại ---
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // =========================================================
    // I. FRIEND REQUESTS (Cải tiến respondToFriendRequest)
    // =========================================================

    @Override
    public FriendRequest sendFriendRequest(Long friendRequest) {
        User currentUser = getCurrentUser();
        User toUser = userRepository.findById(friendRequest)
                .orElseThrow(() -> new RuntimeException("ToUser not found!"));

        // Kiểm tra xem đã gửi yêu cầu hoặc đã là bạn bè chưa (Logic bổ sung)
        if (friendRequestRepository.existsByFromUserIdAndToUserId(currentUser.getId(), toUser.getId()) ||
                friendRepository.existsByUserIdAndFriendId(currentUser.getId(), toUser.getId())) {
            throw new RuntimeException("Yêu cầu đã được gửi hoặc đã là bạn bè.");
        }

        FriendRequest friendRequestEntity = new FriendRequest();
        friendRequestEntity.setCreatedAt(LocalDateTime.now());
        friendRequestEntity.setFromUser(currentUser);
        friendRequestEntity.setToUser(toUser);
        FriendRequest savedRequest = friendRequestRepository.save(friendRequestEntity);

        // Tạo thông báo cho người nhận
        String message = (currentUser.getProfile() != null ? currentUser.getProfile().getDisplayName() : currentUser.getUsername()) 
                         + " đã gửi cho bạn một lời mời kết bạn.";
        notificationService.createAndSendNotification(
                toUser, 
                currentUser, 
                NotificationType.FRIEND_REQUEST_RECEIVED, 
                savedRequest.getId().toString(), 
                message
        );

        return savedRequest;
    }

    @Override
    @Transactional // Đảm bảo giao dịch cho việc tạo 2 mối quan hệ
    public Friend respondToFriendRequest(Long requestId, boolean isAccepted) {
        FriendRequest friendRequest = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found!"));

        // Lấy thông tin hai người dùng
        User userA = friendRequest.getToUser(); // Người chấp nhận/từ chối
        User userB = friendRequest.getFromUser(); // Người gửi lời mời

        // Xóa yêu cầu sau khi xử lý
        friendRequestRepository.deleteById(requestId);

        if (isAccepted) {
            LocalDateTime now = LocalDateTime.now();

            // 1. Mối quan hệ A -> B
            Friend relationAtoB = new Friend();
            relationAtoB.setSince(now);
            relationAtoB.setUser(userA);
            relationAtoB.setFriend(userB);
            friendRepository.save(relationAtoB);

            // 2. Mối quan hệ B -> A (Mối quan hệ hai chiều)
            Friend relationBtoA = new Friend();
            relationBtoA.setSince(now);
            relationBtoA.setUser(userB);
            relationBtoA.setFriend(userA);
            friendRepository.save(relationBtoA);

            String displayName = userA.getProfile() != null ? userA.getProfile().getDisplayName() : userA.getUsername();
            notificationService.createAndSendNotification(
                    userB,
                    userA,
                    NotificationType.FRIEND_REQUEST_ACCEPTED,
                    userA.getId().toString(),
                    displayName + " đã chấp nhận lời mời kết bạn của bạn."
            );

            // 3. Tạo hoặc lấy cuộc hội thoại riêng tư giữa hai người
            return relationAtoB;
        } else {
            String displayName = userA.getProfile() != null ? userA.getProfile().getDisplayName() : userA.getUsername();
            notificationService.createAndSendNotification(
                    userB,
                    userA,
                    NotificationType.SYSTEM,
                    userA.getId().toString(),
                    displayName + " đã từ chối lời mời kết bạn của bạn."
            );
            return null;
        }
    }

    // =========================================================
    // II. FRIEND READ OPERATIONS (Cải tiến getFriends)
    // =========================================================

    @Override
    @Transactional()
    public Page<FriendResponse> getFriends(Pageable pageable) {
        User currentUser = getCurrentUser();

        Page<Friend> friendPage = friendRepository.findByUserId(currentUser.getId(), pageable);

        // Map Friend -> FriendResponse
        List<FriendResponse> responses = friendPage.stream().map(f -> {
            User other;
            if (f.getUser().getId().equals(currentUser.getId())) {
                other = f.getFriend();
            } else {
                other = f.getUser();
            }
            other.setProfile(userProfileRepository.findById(other.getId()).orElse(null));

            String displayName = null;
            String avatarUrl = null;
            if (other.getProfile() != null) {
                displayName = other.getProfile().getDisplayName();
                avatarUrl = other.getProfile().getAvatarUrl();
            } else {
                displayName = other.getUsername(); // fallback
            }

            return FriendResponse.builder()
                    .friendId(other.getId())
                    .friendName(displayName)
                    .avatarUrl(avatarUrl)
                    .isFriend(true)
                    .username(currentUser.getUsername())
                    .since(f.getSince()) // hoặc f.getSince() tùy tên field
                    .build();
        }).collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, friendPage.getTotalElements());
    }

    // --- BỔ SUNG: 3. Lấy chi tiết Bạn bè ---
    public FriendResponse getFriendDetail(Long friendId) {
        // Tìm mối quan hệ Friend (chứ không phải User)
        Friend friendRelation = friendRepository.findById(friendId)
                .orElseThrow(() -> new RuntimeException("Mối quan hệ bạn bè không tồn tại."));

        User otherUser = friendRelation.getFriend();

        return FriendResponse.builder()
                .friendId(otherUser.getId())
                .isFriend(true)
                .username(otherUser.getUsername())
                .friendName(otherUser.getProfile().getDisplayName())
                .avatarUrl(otherUser.getProfile().getAvatarUrl())
                .since(friendRelation.getSince()) // Lấy ngày kết bạn
                .build();
    }

    public List<UserSearchResponse> searchUsers(String keyword) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1️⃣ Lấy danh sách ID của bạn bè và các ID liên quan (Pending)
        List<Long> friendIds = friendRepository
                .findFriendsByUserId(currentUser.getId())
                .stream()
                .map(f -> f.getFriend().getId())
                .collect(Collectors.toList());

        // Thêm ID của chính người dùng vào danh sách loại trừ để không tìm thấy chính mình
        Set<Long> relatedIds = new HashSet<>(friendIds);
        relatedIds.add(currentUser.getId());

        List<Long> pendingIds = friendRequestRepository
                .findPendingIds(currentUser.getId());

        // 2️⃣ Tìm kiếm: Gần đúng cho Bạn bè, Tuyệt đối cho Người lạ

        // 2a. Tìm kiếm GẦN ĐÚNG trong số Bạn bè (IDs nằm trong friendIds)
        List<User> friendMatches = userRepository
                .findByIdInAndUsernameContainingIgnoreCase(friendIds, keyword);

        // 2b. Tìm kiếm TUYỆT ĐỐI trong số Người lạ (IDs KHÔNG nằm trong relatedIds)
        List<User> strangerMatches = userRepository
                .findByIdNotInAndUsernameIgnoreCase(new ArrayList<>(relatedIds), keyword);

        // 3️⃣ Kết hợp và lọc kết quả trùng lặp (nếu có)
        Set<User> combinedUsers = new HashSet<>();
        combinedUsers.addAll(friendMatches);
        combinedUsers.addAll(strangerMatches);

        List<User> finalMatchedUsers = new ArrayList<>(combinedUsers);

        // 4️⃣ Build danh sách kết quả (Logic này giữ nguyên)
        return finalMatchedUsers.stream().map(user -> {
            String status;
            if (friendIds.contains(user.getId())) {
                status = "FRIEND";
            } else if (pendingIds.contains(user.getId())) {
                status = "PENDING";
            } else {
                status = "NEW";
            }

            return UserSearchResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .displayName(user.getProfile() != null ? user.getProfile().getDisplayName() : null)
                    .avatarUrl(user.getProfile() != null ? user.getProfile().getAvatarUrl() : null)
                    .gender(user.getProfile() != null ? user.getProfile().getGender() : null)
                    .presence(user.getProfile() != null ? user.getProfile().getPresence() : null)
                    .status(status)
                    .build();
        }).collect(Collectors.toList());
    }

    // =========================================================
    // III. FRIEND REQUEST READ OPERATIONS (Bổ sung Outgoing)
    // =========================================================

    @Override
    public Page<FriendRequestResponse> getFriendRequests(Pageable pageable) {
        // Lấy danh sách lời mời ĐẾN (Incoming Requests)
        Long currentUserId = getCurrentUser().getId();

        Page<FriendRequest> requestsPage = friendRequestRepository.findByToUserId(currentUserId, pageable);
        
        return requestsPage.map(request -> {
            // Lấy profile của người GỬI request (fromUser)
            UserProfile fromUserProfile = request.getFromUser().getProfile();
            String fromAvatar = fromUserProfile != null ? fromUserProfile.getAvatarUrl() : null;
            String fromDisplayName = fromUserProfile != null && fromUserProfile.getDisplayName() != null 
                    ? fromUserProfile.getDisplayName() 
                    : request.getFromUser().getUsername();
            
            return FriendRequestResponse.builder()
                    .id(request.getId())
                    .fromUserId(request.getFromUser().getId())
                    .fromUsername(request.getFromUser().getUsername())
                    .fromDisplayName(fromDisplayName)
                    .fromAvatar(fromAvatar)
                    .message(request.getMessage())
                    .createdAt(request.getCreatedAt())
                    .build();
        });
    }

    // --- BỔ SUNG: 9. Lời mời ĐÃ GỬI ĐI (Outgoing Requests) ---
    public Page<FriendRequestSentResponse> getOutgoingFriendRequests(Pageable pageable) {
        Long currentUserId = getCurrentUser().getId();

        // Lấy danh sách yêu cầu kết bạn mà người dùng hiện tại đã GỬI
        Page<FriendRequest> requestsPage = friendRequestRepository.findByFromUserId(currentUserId, pageable);

        return requestsPage.map(request -> {
            // Lấy profile của người NHẬN request (toUser)
            UserProfile toUserProfile = request.getToUser().getProfile();
            String toAvatar = toUserProfile != null ? toUserProfile.getAvatarUrl() : null;
            String toDisplayName = toUserProfile != null && toUserProfile.getDisplayName() != null 
                    ? toUserProfile.getDisplayName() 
                    : request.getToUser().getUsername();
            
            return FriendRequestSentResponse.builder()
                    .id(request.getId())
                    .toUserId(request.getToUser().getId())
                    .toAvatar(toAvatar)
                    .toUsername(request.getToUser().getUsername())
                    .toDisplayName(toDisplayName)
                    .message(request.getMessage())
                    .createdAt(request.getCreatedAt())
                    .build();
        });
    }

    // =========================================================
    // IV. MUTATIONS (Cải tiến unfriend, bổ sung cancelRequest)
    // =========================================================

    @Override
    @Transactional
    public void unfriend(Long friendId) {
        User currentUser = getCurrentUser();

        if (currentUser.getId().equals(friendId)) {
            throw new RuntimeException("Không thể hủy kết bạn với chính bạn");
        }

        User other = userRepository.findById(friendId)
                .orElseThrow(() -> new RuntimeException("User bạn muốn hủy không tồn tại"));

        // Lấy và xóa mối quan hệ hai chiều
        List<Friend> relations = friendRepository.findAllBetweenUsers(currentUser.getId(), friendId);

        if (relations == null || relations.isEmpty()) {
            throw new RuntimeException("Hai người không phải là bạn bè");
        }

        friendRepository.deleteAll(relations);
    }

    // --- BỔ SUNG: 10. Hủy lời mời đã gửi đi (Cancel Friend Request) ---
    @Transactional
    public void cancelFriendRequest(Long requestId) {
        User currentUser = getCurrentUser();

        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found!"));

        // Chỉ cho phép người gửi (FromUser) hủy lời mời
        if (!request.getFromUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền hủy lời mời này.");
        }

        friendRequestRepository.delete(request);
    }
}