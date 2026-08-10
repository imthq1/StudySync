package StudySync.StudySync.domain.response;

import StudySync.StudySync.domain.enums.StudyRoomEventType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class StudyRoomEvent {
    private StudyRoomEventType type;
    private Long roomId;
    private Instant occurredAt;
    private Object data;
}
