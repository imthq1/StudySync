package StudySync.StudySync.domain.response;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class CommentActivityResponse {
    private Long id;
    private String content;
    private Long parentId;
    private Long postId;
    private String postTitle;
    private Instant createdAt;
}
