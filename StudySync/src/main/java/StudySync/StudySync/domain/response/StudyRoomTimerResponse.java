package StudySync.StudySync.domain.response;

import StudySync.StudySync.domain.enums.TimerMode;
import StudySync.StudySync.domain.enums.TimerStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class StudyRoomTimerResponse {
    private TimerMode timerMode;
    private TimerStatus timerStatus;
    private Instant timerEndsAt;
    private Integer timerRemainingSeconds;
    private Integer focusDurationMinutes;
    private Integer breakDurationMinutes;
}
