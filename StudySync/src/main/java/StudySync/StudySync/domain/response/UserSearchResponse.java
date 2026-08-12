package StudySync.StudySync.domain.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserSearchResponse {
    private Long id;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private Integer reputationPoints;
    @Getter(AccessLevel.NONE)
    private boolean isFollowing;

    @JsonProperty("isFollowing")
    public boolean isFollowing() {
        return isFollowing;
    }
}
