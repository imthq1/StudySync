package StudySync.StudySync.domain.request;

import StudySync.StudySync.domain.enums.ContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreatePostRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String content;

    private String fileUrl;

    @NotNull(message = "Content type is required")
    private ContentType contentType;

    private List<String> tagNames;
}
