package StudySync.StudySync.domain.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class StudyRoomMemberResponse {
    private Long id;
    private String fullName;
    private String avatarUrl;
}
