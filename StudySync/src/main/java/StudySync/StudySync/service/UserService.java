package StudySync.StudySync.service;

import StudySync.StudySync.domain.entity.User;
import StudySync.StudySync.domain.request.UpdateProfileRequest;
import StudySync.StudySync.domain.response.UserProfileResponse;
import StudySync.StudySync.domain.response.UserResponse;
import StudySync.StudySync.exception.ResourceNotFoundException;
import StudySync.StudySync.repository.FollowRepository;
import StudySync.StudySync.repository.UserRepository;
import StudySync.StudySync.util.SecurityUtil;
import StudySync.StudySync.util.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final SecurityUtil securityUtil;

    public UserService(UserRepository userRepository,
                       FollowRepository followRepository,
                       SecurityUtil securityUtil) {
        this.userRepository = userRepository;
        this.followRepository = followRepository;
        this.securityUtil = securityUtil;
    }

    public User getUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse getMe() {
        return UserMapper.toResponse(getUserOrThrow(securityUtil.getCurrentUserIdOrThrow()));
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = getUserOrThrow(securityUtil.getCurrentUserIdOrThrow());
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getLearningGoals() != null) user.setLearningGoals(request.getLearningGoals());
        return UserMapper.toResponse(userRepository.save(user));
    }

    public UserProfileResponse getProfile(Long userId) {
        User user = getUserOrThrow(userId);
        Long currentUserId = SecurityUtil.getCurrentUserId().orElse(null);
        boolean isFollowing = currentUserId != null
                && followRepository.existsByFollowerIdAndFollowingId(currentUserId, userId);

        return UserProfileResponse.builder()
                .user(UserMapper.toResponse(user))
                .followerCount(followRepository.countByFollowingId(userId))
                .followingCount(followRepository.countByFollowerId(userId))
                .isFollowing(isFollowing)
                .build();
    }
}
