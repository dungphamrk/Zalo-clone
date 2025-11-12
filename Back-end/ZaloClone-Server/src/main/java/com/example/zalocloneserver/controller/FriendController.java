package com.example.zalocloneserver.controller;

import com.example.zalocloneserver.dto.req.UserListItemDto;
import com.example.zalocloneserver.dto.req.auth.UserRequest;
import com.example.zalocloneserver.dto.req.friend.FriendRequestDTO;
import com.example.zalocloneserver.dto.res.UserSearchResponse;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.friend.FriendRequestResponse;
import com.example.zalocloneserver.dto.res.friend.FriendRequestSentResponse;
import com.example.zalocloneserver.dto.res.friend.FriendResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse; // Đã có
import com.example.zalocloneserver.model.constants.SearchType;
import com.example.zalocloneserver.model.entity.Friend;
import com.example.zalocloneserver.model.entity.FriendRequest;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.IUserRepository;
import com.example.zalocloneserver.services.impl.FriendService;
import com.example.zalocloneserver.services.impl.UserService;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/friends")
public class FriendController {

    @Autowired
    private FriendService friendService;

    @Autowired
    private IUserRepository userRepository;
    @Autowired
    private UserService userService;
    // Lưu ý: Đã xóa UserService vì logic tìm kiếm User được đặt trong FriendService

    // =========================================================
    // I. FRIEND READ OPERATIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<APIResponse<Page<FriendResponse>>> getFriends(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<FriendResponse> result = friendService.getFriends(pageable);
        return ResponseEntity.ok(APIResponse.success(result, "Lấy danh sách bạn bè thành công"));
    }

    // --- BỔ SUNG: Lấy chi tiết bạn bè (Endpoint 3) ---
    @GetMapping("/{friendId}")
    public ResponseEntity<APIResponse<FriendResponse>> getFriendDetail(@PathVariable Long friendId) {
        FriendResponse result = friendService.getFriendDetail(friendId);
        return ResponseEntity.ok(APIResponse.success(result, "Lấy chi tiết bạn bè thành công"));
    }

    @GetMapping("/search")
    public APIResponse<List<UserSearchResponse>> search(@RequestParam String username) {
        List<UserSearchResponse> results =friendService.searchUsers(username);
        if (results.isEmpty()) {
            return APIResponse.success(List.of(), "Không tìm thấy người dùng", HttpStatus.OK);
        }
        return APIResponse.success(results, "Tìm kiếm thành công", HttpStatus.OK);
    }
    // =========================================================
    // II. FRIEND REQUEST READ OPERATIONS
    // =========================================================

    // Lời mời CHUNG (chỉ lấy Incoming trong service cũ)
    @GetMapping("/requests")
    public ResponseEntity<APIResponse<Page<FriendRequestResponse>>> getFriendRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<FriendRequestResponse> result = friendService.getFriendRequests(pageable);
        return ResponseEntity.ok(APIResponse.success(result, "Lấy danh sách lời mời kết bạn (Đến) thành công"));
    }

    // --- BỔ SUNG: Lời mời ĐÃ GỬI ĐI (Outgoing Requests - Endpoint 9) ---
    @GetMapping("/requests/outgoing")
    public ResponseEntity<APIResponse<Page<FriendRequestSentResponse>>> getOutgoingFriendRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<FriendRequestSentResponse> result = friendService.getOutgoingFriendRequests(pageable);
        return ResponseEntity.ok(APIResponse.success(result, "Lấy danh sách lời mời đã gửi đi thành công"));
    }

    // =========================================================
    // III. FRIEND MUTATIONS
    // =========================================================

    @PostMapping("/responseToRequest/{friendRequestId}")
    public ResponseEntity<APIResponse<Friend>> addFriend(@PathVariable Long friendRequestId, @RequestParam boolean isAccepted) {
        // Thêm @RequestParam cho isAccepted để đảm bảo Spring Boot nhận đúng
        Friend friend = friendService.respondToFriendRequest(friendRequestId, isAccepted);
        return ResponseEntity.ok(APIResponse.success(friend,"Response created successfully"));
    }

    @PostMapping("/sendRequest")
    public ResponseEntity<APIResponse<FriendRequest>> sendRequest(@Valid @RequestParam Long friendId) {
        FriendRequest friendRequest = friendService.sendFriendRequest(friendId);
        return ResponseEntity.ok(APIResponse.success(friendRequest, "FriendRequest created successfully"));
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<APIResponse<Void>> unfriend(@PathVariable Long friendId) {
        try {
            friendService.unfriend(friendId);
            return ResponseEntity.ok(APIResponse.success(null, "Hủy kết bạn thành công"));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(APIResponse.error(ex.getMessage(), org.springframework.http.HttpStatus.BAD_REQUEST));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(APIResponse.error("Có lỗi phía server", org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    // --- BỔ SUNG: Hủy lời mời đã gửi đi (Endpoint 10) ---
    @DeleteMapping("/requests/{requestId}")
    public ResponseEntity<APIResponse<Void>> cancelFriendRequest(@PathVariable Long requestId) {
        try {
            friendService.cancelFriendRequest(requestId);
            return ResponseEntity.ok(APIResponse.success(null, "Hủy lời mời kết bạn thành công"));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(APIResponse.error(ex.getMessage(), org.springframework.http.HttpStatus.BAD_REQUEST));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(APIResponse.error("Có lỗi phía server", org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}