package StudySync.StudySync.service;

import StudySync.StudySync.domain.entity.Follow;
import StudySync.StudySync.domain.entity.FollowId;
import StudySync.StudySync.domain.response.UserResponse;
import StudySync.StudySync.exception.BadRequestException;
import StudySync.StudySync.repository.FollowRepository;
import StudySync.StudySync.util.SecurityUtil;
import StudySync.StudySync.util.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserService userService;
    private final SecurityUtil securityUtil;

    public FollowService(FollowRepository followRepository,
                         UserService userService,
                         SecurityUtil securityUtil) {
        this.followRepository = followRepository;
        this.userService = userService;
        this.securityUtil = securityUtil;
    }

    @Transactional
    public void follow(Long followingId) {
        Long followerId = securityUtil.getCurrentUserIdOrThrow();
        if (followerId.equals(followingId)) {
            throw new BadRequestException("Cannot follow yourself");
        }
        userService.getUserOrThrow(followingId);
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new BadRequestException("Already following this user");
        }
        followRepository.save(Follow.builder()
                .id(new FollowId(followerId, followingId))
                .follower(userService.getUserOrThrow(followerId))
                .following(userService.getUserOrThrow(followingId))
                .build());
    }

    @Transactional
    public void unfollow(Long followingId) {
        Long followerId = securityUtil.getCurrentUserIdOrThrow();
        FollowId id = new FollowId(followerId, followingId);
        if (!followRepository.existsById(id)) {
            throw new BadRequestException("Not following this user");
        }
        followRepository.deleteById(id);
    }

    public List<UserResponse> getFollowers(Long userId) {
        return followRepository.findByFollowingId(userId).stream()
                .map(f -> UserMapper.toResponse(f.getFollower()))
                .toList();
    }

    public List<UserResponse> getFollowing(Long userId) {
        return followRepository.findByFollowerId(userId).stream()
                .map(f -> UserMapper.toResponse(f.getFollowing()))
                .toList();
    }
}
