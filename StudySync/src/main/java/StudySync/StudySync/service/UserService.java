package StudySync.StudySync.service;

import StudySync.StudySync.domain.entity.User;
import StudySync.StudySync.domain.request.UpdateProfileRequest;
import StudySync.StudySync.domain.response.UserProfileResponse;
import StudySync.StudySync.domain.response.UserResponse;
import StudySync.StudySync.domain.response.ContributionSummaryResponse;
import StudySync.StudySync.domain.response.DailyContributionResponse;
import StudySync.StudySync.domain.response.UserSearchResponse;
import StudySync.StudySync.exception.BadRequestException;
import StudySync.StudySync.exception.ResourceNotFoundException;
import StudySync.StudySync.repository.FollowRepository;
import StudySync.StudySync.repository.UserRepository;
import StudySync.StudySync.repository.PostRepository;
import StudySync.StudySync.repository.CommentRepository;
import StudySync.StudySync.util.SecurityUtil;
import StudySync.StudySync.util.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.DateTimeException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final SecurityUtil securityUtil;

    public UserService(UserRepository userRepository,
                       FollowRepository followRepository,
                       PostRepository postRepository,
                       CommentRepository commentRepository,
                       SecurityUtil securityUtil) {
        this.userRepository = userRepository;
        this.followRepository = followRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
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

    public UserProfileResponse getMyProfile() {
        return getProfile(securityUtil.getCurrentUserIdOrThrow());
    }

    @Transactional(readOnly = true)
    public ContributionSummaryResponse getMyContributions(LocalDate from, LocalDate to, String zoneName) {
        if (from == null || to == null || from.isAfter(to)) {
            throw new BadRequestException("Contribution date range is invalid");
        }
        if (ChronoUnit.DAYS.between(from, to) >= 366) {
            throw new BadRequestException("Contribution date range must not exceed 366 days");
        }

        final ZoneId zone;
        try {
            zone = ZoneId.of(zoneName);
        } catch (DateTimeException error) {
            throw new BadRequestException("Time zone is invalid");
        }

        Long userId = securityUtil.getCurrentUserIdOrThrow();
        Instant fromInstant = from.atStartOfDay(zone).toInstant();
        Instant toExclusive = to.plusDays(1).atStartOfDay(zone).toInstant();
        List<Instant> postTimes = postRepository.findContributionTimes(userId, fromInstant, toExclusive);
        List<Instant> commentTimes = commentRepository.findContributionTimes(userId, fromInstant, toExclusive);
        Map<LocalDate, Long> counts = new HashMap<>();
        postTimes.forEach(time -> counts.merge(time.atZone(zone).toLocalDate(), 1L, Long::sum));
        commentTimes.forEach(time -> counts.merge(time.atZone(zone).toLocalDate(), 1L, Long::sum));

        List<DailyContributionResponse> days = from.datesUntil(to.plusDays(1))
                .map(date -> DailyContributionResponse.builder()
                        .date(date)
                        .count(counts.getOrDefault(date, 0L))
                        .build())
                .toList();
        long total = postTimes.size() + commentTimes.size();
        return ContributionSummaryResponse.builder()
                .total(total)
                .postCount(postTimes.size())
                .commentCount(commentTimes.size())
                .activeDays(counts.size())
                .days(days)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<UserSearchResponse> searchUsers(String query, Pageable pageable) {
        String normalizedQuery = query == null ? "" : query.trim();
        if (normalizedQuery.length() < 2) {
            throw new BadRequestException("Search query must contain at least 2 characters");
        }

        Pageable safePageable = PageRequest.of(
                pageable.getPageNumber(),
                Math.min(pageable.getPageSize(), 20),
                Sort.by(Sort.Order.asc("fullName"), Sort.Order.asc("id")));
        Long currentUserId = securityUtil.getCurrentUserIdOrThrow();
        return userRepository.searchUsers(currentUserId, normalizedQuery, safePageable)
                .map(user -> UserSearchResponse.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .avatarUrl(user.getAvatarUrl())
                        .bio(user.getBio())
                        .reputationPoints(user.getReputationPoints())
                        .isFollowing(followRepository.existsByFollowerIdAndFollowingId(currentUserId, user.getId()))
                        .build());
    }
}
