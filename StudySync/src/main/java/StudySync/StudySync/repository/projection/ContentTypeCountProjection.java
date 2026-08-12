package StudySync.StudySync.repository.projection;

import StudySync.StudySync.domain.enums.ContentType;

public interface ContentTypeCountProjection {
    ContentType getContentType();
    long getPostCount();
}
