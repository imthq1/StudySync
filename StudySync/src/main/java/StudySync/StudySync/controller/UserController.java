package StudySync.StudySync.controller;

import StudySync.StudySync.domain.request.UpdateProfileRequest;
import StudySync.StudySync.domain.response.UserProfileResponse;
import StudySync.StudySync.domain.response.UserResponse;
import StudySync.StudySync.service.UserService;
import StudySync.StudySync.util.ApiMessage;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @ApiMessage("Fetch current user")
    public ResponseEntity<UserResponse> getMe() {
        return ResponseEntity.ok(userService.getMe());
    }

    @PutMapping("/me")
    @ApiMessage("Update profile success")
    public ResponseEntity<UserResponse> updateProfile(@RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @GetMapping("/{id}/profile")
    @ApiMessage("Fetch user profile")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }   
}
