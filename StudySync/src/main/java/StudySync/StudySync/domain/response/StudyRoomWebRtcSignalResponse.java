package StudySync.StudySync.domain.response;

import StudySync.StudySync.domain.enums.StudyRoomWebRtcSignalType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StudyRoomWebRtcSignalResponse {
    private StudyRoomWebRtcSignalType signalType;
    private Long fromUserId;
    private Long targetUserId;
    private String sdp;
    private String candidate;
    private String sdpMid;
    private Integer sdpMLineIndex;
    private String usernameFragment;
    private Boolean cameraEnabled;
}
