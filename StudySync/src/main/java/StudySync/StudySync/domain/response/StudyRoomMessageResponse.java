package StudySync.StudySync.domain.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class StudyRoomMessageResponse {
    private Long id;
    private Long roomId;
    private StudyRoomMemberResponse sender;
    private String content;
    private Instant createdAt;
}
