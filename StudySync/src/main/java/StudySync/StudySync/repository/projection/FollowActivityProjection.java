package StudySync.StudySync.repository.projection;

import java.time.Instant;

public interface FollowActivityProjection {
    String getActivityType();
    Long getActivityId();
    Instant getOccurredAt();
    Long getActorId();
    String getActorFullName();
    String getActorAvatarUrl();
    Integer getActorReputationPoints();
    Long getPostId();
    String getPostTitle();
    String getPostContent();
    String getPostContentType();
    String getPostFileUrl();
    Long getCommentId();
    String getCommentContent();
    Long getParentCommentId();
}
