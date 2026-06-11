package StudySync.StudySync.domain.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class FileUploadResponse {
    private String fileUrl;
    private String originalFilename;
}
