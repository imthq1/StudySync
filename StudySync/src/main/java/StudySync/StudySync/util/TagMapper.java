package StudySync.StudySync.util;

import StudySync.StudySync.domain.entity.Tag;
import StudySync.StudySync.domain.response.TagResponse;

public final class TagMapper {
 
    private TagMapper() {}
 
    public static TagResponse toResponse(Tag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .build();
    }
}
