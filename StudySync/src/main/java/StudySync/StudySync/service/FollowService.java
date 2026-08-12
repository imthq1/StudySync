package StudySync.StudySync.service;

import StudySync.StudySync.domain.entity.Follow;
import StudySync.StudySync.domain.entity.FollowId;
import StudySync.StudySync.domain.response.UserResponse;
import StudySync.StudySync.domain.enums.ContentType;
import StudySync.StudySync.domain.enums.FollowActivityType;
import StudySync.StudySync.domain.response.FollowActivityResponse;
import StudySync.StudySync.exception.BadRequestException;
import StudySync.StudySync.repository.FollowRepository;
import StudySync.StudySync.repository.projection.FollowActivityProjection;
import StudySync.StudySync.util.SecurityUtil;
import StudySync.StudySync.util.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserService userService;
    private final SecurityUtil securityUtil;
    private final FileStorageService fileStorageService;

    public FollowService(FollowRepository followRepository,
                         UserService userService,
                         SecurityUtil securityUtil,
                         FileStorageService fileStorageService) {
        this.followRepository = followRepository;
        this.userService = userService;
        this.securityUtil = securityUtil;
        this.fileStorageService = fileStorageService;
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

    @Transactional(readOnly = true)
    public Page<FollowActivityResponse> getFeed(Pageable pageable) {
        Long currentUserId = securityUtil.getCurrentUserIdOrThrow();
        Pageable safePageable = PageRequest.of(pageable.getPageNumber(), Math.min(pageable.getPageSize(), 50));
        return followRepository.findActivityFeed(currentUserId, safePageable).map(this::toActivityResponse);
    }

    private FollowActivityResponse toActivityResponse(FollowActivityProjection row) {
        FollowActivityResponse.CommentSummary comment = row.getCommentId() == null ? null
                : FollowActivityResponse.CommentSummary.builder()
                .id(row.getCommentId())
                .content(row.getCommentContent())
                .parentId(row.getParentCommentId())
                .build();
        return FollowActivityResponse.builder()
                .type(FollowActivityType.valueOf(row.getActivityType()))
                .occurredAt(row.getOccurredAt())
                .actor(FollowActivityResponse.Actor.builder()
                        .id(row.getActorId())
                        .fullName(row.getActorFullName())
                        .avatarUrl(row.getActorAvatarUrl())
                        .reputationPoints(row.getActorReputationPoints())
                        .build())
                .post(FollowActivityResponse.PostSummary.builder()
                        .id(row.getPostId())
                        .title(row.getPostTitle())
                        .content(row.getPostContent())
                        .contentType(ContentType.valueOf(row.getPostContentType()))
                        .fileUrl(fileStorageService.createDownloadUrl(row.getPostFileUrl()))
                        .build())
                .comment(comment)
                .build();
    }
}
