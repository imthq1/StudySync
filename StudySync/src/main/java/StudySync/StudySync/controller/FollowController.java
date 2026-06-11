package StudySync.StudySync.controller;

import StudySync.StudySync.domain.response.UserResponse;
import StudySync.StudySync.service.FollowService;
import StudySync.StudySync.util.ApiMessage;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/follows")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
        }

    @PostMapping("/{userId}")
    @ApiMessage("Follow success")
    public void follow(@PathVariable Long userId) {
        followService.follow(userId);
    }

    @DeleteMapping("/{userId}")
    @ApiMessage("Unfollow success")
    public void unfollow(@PathVariable Long userId) {
        followService.unfollow(userId);
    }

    @GetMapping("/{userId}/followers")
    @ApiMessage("Fetch followers")
    public ResponseEntity<List<UserResponse>> followers(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowers(userId));
    }

    @GetMapping("/{userId}/following")
    @ApiMessage("Fetch following")
    public ResponseEntity<List<UserResponse>> following(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowing(userId));
    }
}
