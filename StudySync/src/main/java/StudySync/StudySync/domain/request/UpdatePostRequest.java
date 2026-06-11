package StudySync.StudySync.domain.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdatePostRequest {

    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String content;

    private List<String> tagNames;
}
