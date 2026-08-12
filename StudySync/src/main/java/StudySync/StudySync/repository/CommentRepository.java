package StudySync.StudySync.repository;

import StudySync.StudySync.domain.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);

    long countByPostId(Long postId);

    long countByAuthorId(Long authorId);

    long countByAuthorIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(Long authorId, Instant from, Instant to);

    Page<Comment> findByAuthorId(Long authorId, Pageable pageable);

    @Query("SELECT c.createdAt FROM Comment c WHERE c.author.id = :userId AND c.createdAt >= :from AND c.createdAt < :to")
    List<Instant> findContributionTimes(@Param("userId") Long userId,
                                        @Param("from") Instant from,
                                        @Param("to") Instant to);
}
