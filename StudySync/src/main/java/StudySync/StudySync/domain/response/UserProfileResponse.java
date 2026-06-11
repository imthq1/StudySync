package StudySync.StudySync.domain.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserProfileResponse {
    private UserResponse user;
    private long followerCount;
    private long followingCount;
    private boolean isFollowing;
}
