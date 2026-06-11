package StudySync.StudySync.repository;

import StudySync.StudySync.domain.entity.Post;
import StudySync.StudySync.domain.enums.ContentType;
import StudySync.StudySync.domain.enums.InteractionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByAuthorId(Long authorId, Pageable pageable);

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
    Page<Post> findBookmarkedByUserId(@Param("userId") Long userId,
                                      @Param("type") InteractionType type,
                                      Pageable pageable);
}
