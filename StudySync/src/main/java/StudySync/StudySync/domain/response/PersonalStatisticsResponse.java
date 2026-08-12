package StudySync.StudySync.domain.response;

import StudySync.StudySync.domain.enums.ContentType;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

@Getter
@Builder
public class PersonalStatisticsResponse {
    private Instant generatedAt;
    private ActivityTotals allTime;
    private PeriodComparison comparison30Days;
    private ReceivedEngagement received;
    private SocialCounts social;
    private List<ContentTypeStatistic> contentTypeDistribution;
    private List<TopPostStatistic> topPosts;

    @Getter
    @Builder
    public static class ActivityTotals {
        private long posts;
        private long comments;
        private long contributions;
        private long activeRoomMemberships;
    }

    @Getter
    @Builder
    public static class PeriodMetrics {
        private long posts;
        private long comments;
        private long contributions;
        private long likesReceived;
        private long bookmarksReceived;
        private long followersGained;
    }

    @Getter
    @Builder
    public static class PeriodComparison {
        private PeriodMetrics current;
        private PeriodMetrics previous;
        private PeriodMetrics delta;
    }

    @Getter
    @Builder
    public static class ReceivedEngagement {
        private long likes;
        private long bookmarks;
    }

    @Getter
    @Builder
    public static class SocialCounts {
        private long followers;
        private long following;
    }

    @Getter
    @Builder
    public static class ContentTypeStatistic {
        private ContentType contentType;
        private long count;
        private double percentage;
    }

    @Getter
    @Builder
    public static class TopPostStatistic {
        private Long id;
        private String title;
        private ContentType contentType;
        private Instant createdAt;
        private long likeCount;
        private long bookmarkCount;
        private long commentCount;
        private long engagementCount;
    }
}
