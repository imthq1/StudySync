package StudySync.StudySync.domain.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateStudyRoomRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String name;

    @Size(max = 160, message = "Topic must not exceed 160 characters")
    private String topic;

    private String description;

    @NotNull(message = "Max members is required")
    @Min(value = 2, message = "Max members must be at least 2")
    @Max(value = 50, message = "Max members must not exceed 50")
    private Integer maxMembers;

    @Min(value = 1, message = "Focus duration must be at least 1 minute")
    @Max(value = 120, message = "Focus duration must not exceed 120 minutes")
    private Integer focusDurationMinutes;

    @Min(value = 1, message = "Break duration must be at least 1 minute")
    @Max(value = 60, message = "Break duration must not exceed 60 minutes")
    private Integer breakDurationMinutes;
}
