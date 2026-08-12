package StudySync.StudySync.repository.projection;

import java.time.Instant;

public interface TopPostStatisticsProjection {
    Long getId();
    String getTitle();
    String getContentType();
    Instant getCreatedAt();
    long getLikeCount();
    long getBookmarkCount();
    long getCommentCount();
    long getEngagementCount();
}
