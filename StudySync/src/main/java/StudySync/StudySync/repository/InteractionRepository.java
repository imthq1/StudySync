package StudySync.StudySync.repository;

import StudySync.StudySync.domain.entity.Interaction;
import StudySync.StudySync.domain.entity.InteractionId;
import StudySync.StudySync.domain.enums.InteractionType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InteractionRepository extends JpaRepository<Interaction, InteractionId> {

    long countByPostIdAndIdType(Long postId, InteractionType type);

    boolean existsByIdUserIdAndIdPostIdAndIdType(Long userId, Long postId, InteractionType type);
}
