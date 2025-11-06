package com.example.zalocloneserver.controller;

import com.example.zalocloneserver.dto.req.auth.UserRequest;
import com.example.zalocloneserver.dto.req.friend.FriendRequestDTO;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.friend.FriendRequestResponse;
import com.example.zalocloneserver.dto.res.friend.FriendResponse;
import com.example.zalocloneserver.model.entity.Friend;
import com.example.zalocloneserver.model.entity.FriendRequest;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.services.impl.FriendService;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendController {
    @Autowired
    private FriendService friendService;

    @GetMapping
    public ResponseEntity<APIResponse<Page<FriendResponse>>> getFriends(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<FriendResponse> result = friendService.getFriends(pageable);
        return ResponseEntity.ok(APIResponse.success(result, "Lấy danh sách bạn bè thành công"));
    }

    @GetMapping("/requests")
    public ResponseEntity<APIResponse<Page<FriendRequestResponse>>> getFriendRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<FriendRequestResponse> result = friendService.getFriendRequests(pageable);
        return ResponseEntity.ok(APIResponse.success(result, "Lấy danh sách lời mời kết bạn thành công"));
    }

    @PostMapping("/responseToRequest/{friendRequestId}")
    public ResponseEntity<APIResponse<Friend>> addFriend(@PathVariable Long friendRequestId, boolean isAccepted) {
       Friend friend = friendService.respondToFriendRequest(friendRequestId, isAccepted);
        return ResponseEntity.ok(APIResponse.success(friend,"Response created successfully"));
    };
    @PostMapping("sendRequest")
    public ResponseEntity<APIResponse<FriendRequest>> sendRequest(@Valid @RequestBody FriendRequestDTO friendRequestDTO) {
        FriendRequest friendRequest = friendService.sendFriendRequest(friendRequestDTO);
        return ResponseEntity.ok(APIResponse.success(friendRequest, "FriendRequest created successfully"));
    };
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
}
