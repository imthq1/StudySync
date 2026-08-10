package StudySync.StudySync.domain.request;

import StudySync.StudySync.domain.enums.TimerAction;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudyRoomTimerRequest {

    @NotNull(message = "Action is required")
    private TimerAction action;
}
