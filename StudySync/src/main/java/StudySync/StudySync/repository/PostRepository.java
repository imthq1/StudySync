package StudySync.StudySync.repository;

import StudySync.StudySync.domain.entity.Post;
import StudySync.StudySync.domain.enums.ContentType;
import StudySync.StudySync.domain.enums.InteractionType;
import StudySync.StudySync.repository.projection.ContentTypeCountProjection;
import StudySync.StudySync.repository.projection.TopPostStatisticsProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByAuthorId(Long authorId, Pageable pageable);

    long countByAuthorId(Long authorId);

    long countByAuthorIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(Long authorId, Instant from, Instant to);

    Page<Post> findByContentType(ContentType contentType, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN p.tags t WHERE LOWER(t.name) = LOWER(:tagName)")
    Page<Post> findByTagName(@Param("tagName") String tagName, Pageable pageable);

    @Query("""
            SELECT p FROM Post p
            WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))
            """)
    Page<Post> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("""
            SELECT p FROM Post p
            JOIN Interaction i ON i.post = p
            WHERE i.id.userId = :userId AND i.id.type = :type
            """)
    Page<Post> findInteractedByUserId(@Param("userId") Long userId,
                                      @Param("type") InteractionType type,
                                      Pageable pageable);

    @Query("SELECT p.createdAt FROM Post p WHERE p.author.id = :userId AND p.createdAt >= :from AND p.createdAt < :to")
    List<Instant> findContributionTimes(@Param("userId") Long userId,
                                        @Param("from") Instant from,
                                        @Param("to") Instant to);

    @Query("SELECT p.contentType AS contentType, COUNT(p) AS postCount FROM Post p WHERE p.author.id = :userId GROUP BY p.contentType")
    List<ContentTypeCountProjection> countByContentTypeForUser(@Param("userId") Long userId);

    @Query(value = """
            SELECT p.id AS "id",
                   p.title AS "title",
                   CAST(p.content_type AS varchar) AS "contentType",
                   p.created_at AS "createdAt",
                   (SELECT COUNT(*) FROM interactions i WHERE i.post_id = p.id AND i.type = 'LIKE') AS "likeCount",
                   (SELECT COUNT(*) FROM interactions i WHERE i.post_id = p.id AND i.type = 'BOOKMARK') AS "bookmarkCount",
                   (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS "commentCount",
                   (SELECT COUNT(*) FROM interactions i WHERE i.post_id = p.id)
                       + (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS "engagementCount"
            FROM posts p
            WHERE p.author_id = :userId
            ORDER BY "engagementCount" DESC, "likeCount" DESC, p.created_at DESC
            """, nativeQuery = true)
    List<TopPostStatisticsProjection> findTopPostsByEngagement(@Param("userId") Long userId, Pageable pageable);
}
