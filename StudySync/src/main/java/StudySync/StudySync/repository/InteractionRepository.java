package StudySync.StudySync.repository;

import StudySync.StudySync.domain.entity.Interaction;
import StudySync.StudySync.domain.entity.InteractionId;
import StudySync.StudySync.domain.enums.InteractionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface InteractionRepository extends JpaRepository<Interaction, InteractionId> {

    long countByPostIdAndIdType(Long postId, InteractionType type);

    boolean existsByIdUserIdAndIdPostIdAndIdType(Long userId, Long postId, InteractionType type);

    @Query("SELECT COUNT(i) FROM Interaction i WHERE i.post.author.id = :userId AND i.id.type = :type")
    long countReceivedByUser(@Param("userId") Long userId, @Param("type") InteractionType type);

    @Query("SELECT COUNT(i) FROM Interaction i WHERE i.post.author.id = :userId AND i.id.type = :type AND i.createdAt >= :from AND i.createdAt < :to")
    long countReceivedByUserInPeriod(@Param("userId") Long userId,
                                     @Param("type") InteractionType type,
                                     @Param("from") Instant from,
                                     @Param("to") Instant to);
}
