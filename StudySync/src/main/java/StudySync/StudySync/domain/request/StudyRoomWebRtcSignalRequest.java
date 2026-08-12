package StudySync.StudySync.domain.request;

import StudySync.StudySync.domain.enums.StudyRoomWebRtcSignalType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudyRoomWebRtcSignalRequest {

    @NotNull(message = "Signal type is required")
    private StudyRoomWebRtcSignalType signalType;

    private Long targetUserId;

    @Size(max = 60000, message = "SDP must not exceed 60000 characters")
    private String sdp;

    @Size(max = 4096, message = "ICE candidate must not exceed 4096 characters")
    private String candidate;

    @Size(max = 255, message = "SDP mid must not exceed 255 characters")
    private String sdpMid;

    private Integer sdpMLineIndex;

    @Size(max = 255, message = "Username fragment must not exceed 255 characters")
    private String usernameFragment;

    private Boolean cameraEnabled;
}
