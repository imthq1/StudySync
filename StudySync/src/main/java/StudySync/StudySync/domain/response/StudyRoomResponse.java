package StudySync.StudySync.domain.response;

import StudySync.StudySync.domain.enums.StudyRoomStatus;
import StudySync.StudySync.domain.enums.TimerMode;
import StudySync.StudySync.domain.enums.TimerStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
public class StudyRoomResponse {
    private Long id;
    private StudyRoomMemberResponse owner;
    private String name;
    private String topic;
    private String description;
    private StudyRoomStatus status;
    private Integer maxMembers;
    private Integer memberCount;
    private Boolean isMember;
    private Boolean isOwner;
    private Integer focusDurationMinutes;
    private Integer breakDurationMinutes;
    private TimerMode timerMode;
    private TimerStatus timerStatus;
    private Instant timerEndsAt;
    private Integer timerRemainingSeconds;
    private List<StudyRoomMemberResponse> members;
    private List<StudyRoomMessageResponse> messages;
    private Instant createdAt;
    private Instant updatedAt;
}
