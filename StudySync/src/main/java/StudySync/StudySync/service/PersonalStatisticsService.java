package StudySync.StudySync.service;

import StudySync.StudySync.domain.enums.ContentType;
import StudySync.StudySync.domain.enums.InteractionType;
import StudySync.StudySync.domain.response.PersonalStatisticsResponse;
import StudySync.StudySync.repository.CommentRepository;
import StudySync.StudySync.repository.FollowRepository;
import StudySync.StudySync.repository.InteractionRepository;
import StudySync.StudySync.repository.PostRepository;
import StudySync.StudySync.repository.StudyRoomMemberRepository;
import StudySync.StudySync.repository.projection.ContentTypeCountProjection;
import StudySync.StudySync.util.SecurityUtil;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PersonalStatisticsService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final InteractionRepository interactionRepository;
    private final FollowRepository followRepository;
    private final StudyRoomMemberRepository roomMemberRepository;
    private final SecurityUtil securityUtil;

    public PersonalStatisticsService(PostRepository postRepository,
                                     CommentRepository commentRepository,
                                     InteractionRepository interactionRepository,
                                     FollowRepository followRepository,
                                     StudyRoomMemberRepository roomMemberRepository,
                                     SecurityUtil securityUtil) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.interactionRepository = interactionRepository;
        this.followRepository = followRepository;
        this.roomMemberRepository = roomMemberRepository;
        this.securityUtil = securityUtil;
    }

    @Transactional(readOnly = true)
    public PersonalStatisticsResponse getMyStatistics() {
        Long userId = securityUtil.getCurrentUserIdOrThrow();
        Instant now = Instant.now();
        Instant currentFrom = now.minus(30, ChronoUnit.DAYS);
        Instant previousFrom = currentFrom.minus(30, ChronoUnit.DAYS);

        long posts = postRepository.countByAuthorId(userId);
        long comments = commentRepository.countByAuthorId(userId);
        long likes = interactionRepository.countReceivedByUser(userId, InteractionType.LIKE);
        long bookmarks = interactionRepository.countReceivedByUser(userId, InteractionType.BOOKMARK);

        PersonalStatisticsResponse.PeriodMetrics current = periodMetrics(userId, currentFrom, now);
        PersonalStatisticsResponse.PeriodMetrics previous = periodMetrics(userId, previousFrom, currentFrom);
        PersonalStatisticsResponse.PeriodMetrics delta = PersonalStatisticsResponse.PeriodMetrics.builder()
                .posts(current.getPosts() - previous.getPosts())
                .comments(current.getComments() - previous.getComments())
                .contributions(current.getContributions() - previous.getContributions())
                .likesReceived(current.getLikesReceived() - previous.getLikesReceived())
                .bookmarksReceived(current.getBookmarksReceived() - previous.getBookmarksReceived())
                .followersGained(current.getFollowersGained() - previous.getFollowersGained())
                .build();

        Map<ContentType, Long> distribution = postRepository.countByContentTypeForUser(userId).stream()
                .collect(Collectors.toMap(ContentTypeCountProjection::getContentType, ContentTypeCountProjection::getPostCount));

        return PersonalStatisticsResponse.builder()
                .generatedAt(now)
                .allTime(PersonalStatisticsResponse.ActivityTotals.builder()
                        .posts(posts)
                        .comments(comments)
                        .contributions(posts + comments)
                        .activeRoomMemberships(roomMemberRepository.countByUserId(userId))
                        .build())
                .comparison30Days(PersonalStatisticsResponse.PeriodComparison.builder()
                        .current(current)
                        .previous(previous)
                        .delta(delta)
                        .build())
                .received(PersonalStatisticsResponse.ReceivedEngagement.builder().likes(likes).bookmarks(bookmarks).build())
                .social(PersonalStatisticsResponse.SocialCounts.builder()
                        .followers(followRepository.countByFollowingId(userId))
                        .following(followRepository.countByFollowerId(userId))
                        .build())
                .contentTypeDistribution(Arrays.stream(ContentType.values())
                        .map(type -> {
                            long count = distribution.getOrDefault(type, 0L);
                            return PersonalStatisticsResponse.ContentTypeStatistic.builder()
                                    .contentType(type)
                                    .count(count)
                                    .percentage(posts == 0 ? 0 : count * 100.0 / posts)
                                    .build();
                        }).toList())
                .topPosts(postRepository.findTopPostsByEngagement(userId, PageRequest.of(0, 5)).stream()
                        .map(post -> PersonalStatisticsResponse.TopPostStatistic.builder()
                                .id(post.getId())
                                .title(post.getTitle())
                                .contentType(ContentType.valueOf(post.getContentType()))
                                .createdAt(post.getCreatedAt())
                                .likeCount(post.getLikeCount())
                                .bookmarkCount(post.getBookmarkCount())
                                .commentCount(post.getCommentCount())
                                .engagementCount(post.getEngagementCount())
                                .build()).toList())
                .build();
    }

    private PersonalStatisticsResponse.PeriodMetrics periodMetrics(Long userId, Instant from, Instant to) {
        long posts = postRepository.countByAuthorIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(userId, from, to);
        long comments = commentRepository.countByAuthorIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(userId, from, to);
        return PersonalStatisticsResponse.PeriodMetrics.builder()
                .posts(posts)
                .comments(comments)
                .contributions(posts + comments)
                .likesReceived(interactionRepository.countReceivedByUserInPeriod(userId, InteractionType.LIKE, from, to))
                .bookmarksReceived(interactionRepository.countReceivedByUserInPeriod(userId, InteractionType.BOOKMARK, from, to))
                .followersGained(followRepository.countByFollowingIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(userId, from, to))
                .build();
    }
}
