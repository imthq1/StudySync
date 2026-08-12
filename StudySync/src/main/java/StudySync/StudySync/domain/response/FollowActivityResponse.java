package StudySync.StudySync.domain.response;

import StudySync.StudySync.domain.enums.ContentType;
import StudySync.StudySync.domain.enums.FollowActivityType;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class FollowActivityResponse {
    private FollowActivityType type;
    private Instant occurredAt;
    private Actor actor;
    private PostSummary post;
    private CommentSummary comment;

    @Getter
    @Builder
    public static class Actor {
        private Long id;
        private String fullName;
        private String avatarUrl;
        private Integer reputationPoints;
    }

    @Getter
    @Builder
    public static class PostSummary {
        private Long id;
        private String title;
        private String content;
        private ContentType contentType;
        private String fileUrl;
    }

    @Getter
    @Builder
    public static class CommentSummary {
        private Long id;
        private String content;
        private Long parentId;
    }
}
