package com.example.zalocloneserver.services;

import com.example.zalocloneserver.dto.req.friend.FriendRequestDTO;
import com.example.zalocloneserver.dto.res.friend.FriendRequestResponse;
import com.example.zalocloneserver.dto.res.friend.FriendResponse;
import com.example.zalocloneserver.model.entity.Friend;
import com.example.zalocloneserver.model.entity.FriendRequest;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RequestParam;


public interface IFriendService {
    FriendRequest sendFriendRequest(@Valid @RequestParam Long friendRequest);
    Friend respondToFriendRequest(Long requestId, boolean isAccepted);
    Page<FriendResponse> getFriends(Pageable pageable);
    Page<FriendRequestResponse> getFriendRequests(Pageable pageable);
    void unfriend(Long friendId);
}
