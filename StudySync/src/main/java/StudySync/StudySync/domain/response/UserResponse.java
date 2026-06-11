package StudySync.StudySync.domain.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private String learningGoals;
    private Integer reputationPoints;
    private Instant createdAt;
}
