package com.example.zalocloneserver.controller;

import com.example.zalocloneserver.dto.NotificationResponse;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.IUserRepository;
import com.example.zalocloneserver.services.INotificationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Notification", description = "API cho thông báo")
public class NotificationController {

    private final INotificationService notificationService;
    private final IUserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<APIResponse<Page<NotificationResponse>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponse> notifications = notificationService.getNotificationsForUser(getCurrentUser(), pageable);
        return ResponseEntity.ok(APIResponse.success(notifications, "Lấy thông báo thành công"));
    }

    @PostMapping("/mark-all-as-seen")
    public ResponseEntity<APIResponse<Map<String, Long>>> markAllAsSeen() {
        long markedCount = notificationService.markAllAsSeen(getCurrentUser());
        return ResponseEntity.ok(APIResponse.success(Map.of("markedCount", markedCount), "Đã đánh dấu tất cả là đã xem"));
    }

    @GetMapping("/unseen-count")
    public ResponseEntity<APIResponse<Map<String, Long>>> getUnseenCount() {
        long count = notificationService.countUnseenNotifications(getCurrentUser());
        return ResponseEntity.ok(APIResponse.success(Map.of("unseenCount", count), "Lấy số thông báo chưa xem thành công"));
    }
    
    @DeleteMapping("/all")
    public ResponseEntity<APIResponse<Map<String, Long>>> deleteAllNotifications() {
        long deletedCount = notificationService.deleteAllNotifications(getCurrentUser());
        return ResponseEntity.ok(APIResponse.success(Map.of("deletedCount", deletedCount), "Đã xóa tất cả thông báo"));
    }
}

