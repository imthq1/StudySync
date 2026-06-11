package StudySync.StudySync.domain.response;

import StudySync.StudySync.domain.enums.ContentType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private ContentType contentType;
    private String fileUrl;
    private UserResponse author;
    private List<TagResponse> tags;
    private long likeCount;
    private long commentCount;
    private boolean likedByCurrentUser;
    private boolean bookmarkedByCurrentUser;
    private Instant createdAt;
    private Instant updatedAt;
}
