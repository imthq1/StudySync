package StudySync.StudySync.domain.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
public class CommentResponse {
    private Long id;
    private String content;
    private UserResponse author;
    private Long parentId;
    private List<CommentResponse> replies;
    private Instant createdAt;
}
