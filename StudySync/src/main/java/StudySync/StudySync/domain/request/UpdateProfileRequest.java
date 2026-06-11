package StudySync.StudySync.domain.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    private String fullName;
    private String avatarUrl;
    private String bio;
    private String learningGoals;
}
