package StudySync.StudySync.controller;

import StudySync.StudySync.domain.request.UpdateProfileRequest;
import StudySync.StudySync.domain.response.UserProfileResponse;
import StudySync.StudySync.domain.response.UserResponse;
import StudySync.StudySync.domain.response.ContributionSummaryResponse;
import StudySync.StudySync.domain.response.UserSearchResponse;
import StudySync.StudySync.domain.response.PersonalStatisticsResponse;
import StudySync.StudySync.service.PersonalStatisticsService;
import StudySync.StudySync.service.UserService;
import StudySync.StudySync.util.ApiMessage;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final PersonalStatisticsService personalStatisticsService;

    public UserController(UserService userService, PersonalStatisticsService personalStatisticsService) {
        this.userService = userService;
        this.personalStatisticsService = personalStatisticsService;
    }

    @GetMapping("/me")
    @ApiMessage("Fetch current user")
    public ResponseEntity<UserResponse> getMe() {
        return ResponseEntity.ok(userService.getMe());
    }

    @GetMapping("/me/profile")
    @ApiMessage("Fetch current user profile")
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        return ResponseEntity.ok(userService.getMyProfile());
    }

    @GetMapping("/me/contributions")
    @ApiMessage("Fetch current user contributions")
    public ResponseEntity<ContributionSummaryResponse> getMyContributions(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to,
            @RequestParam(defaultValue = "Asia/Ho_Chi_Minh") String zone) {
        return ResponseEntity.ok(userService.getMyContributions(from, to, zone));
    }

    @GetMapping("/search")
    @ApiMessage("Search users")
    public ResponseEntity<Page<UserSearchResponse>> searchUsers(
            @RequestParam String q,
            @PageableDefault(size = 8) Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(q, pageable));
    }

    @GetMapping("/me/statistics")
    @ApiMessage("Fetch current user personal statistics")
    public ResponseEntity<PersonalStatisticsResponse> getMyStatistics() {
        return ResponseEntity.ok(personalStatisticsService.getMyStatistics());
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
