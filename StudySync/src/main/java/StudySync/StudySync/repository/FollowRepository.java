package StudySync.StudySync.repository;

import StudySync.StudySync.domain.entity.Follow;
import StudySync.StudySync.domain.entity.FollowId;
import StudySync.StudySync.repository.projection.FollowActivityProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.time.Instant;

public interface FollowRepository extends JpaRepository<Follow, FollowId> {
    List<Follow> findByFollowerId(Long followerId);
    List<Follow> findByFollowingId(Long followingId);
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    long countByFollowingId(Long followingId);
    long countByFollowerId(Long followerId);
    long countByFollowingIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(Long followingId, Instant from, Instant to);

    @Query(value = """
            SELECT
                'POST' AS "activityType",
                p.id AS "activityId",
                p.created_at AS "occurredAt",
                u.id AS "actorId",
                u.full_name AS "actorFullName",
                u.avatar_url AS "actorAvatarUrl",
                u.reputation_points AS "actorReputationPoints",
                p.id AS "postId",
                p.title AS "postTitle",
                p.content AS "postContent",
                CAST(p.content_type AS varchar) AS "postContentType",
                p.file_url AS "postFileUrl",
                CAST(NULL AS bigint) AS "commentId",
                CAST(NULL AS text) AS "commentContent",
                CAST(NULL AS bigint) AS "parentCommentId"
            FROM follows f
            JOIN posts p ON p.author_id = f.following_id
            JOIN users u ON u.id = p.author_id
            WHERE f.follower_id = :currentUserId

            UNION ALL

            SELECT
                'COMMENT' AS "activityType",
                c.id AS "activityId",
                c.created_at AS "occurredAt",
                u.id AS "actorId",
                u.full_name AS "actorFullName",
                u.avatar_url AS "actorAvatarUrl",
                u.reputation_points AS "actorReputationPoints",
                p.id AS "postId",
                p.title AS "postTitle",
                p.content AS "postContent",
                CAST(p.content_type AS varchar) AS "postContentType",
                p.file_url AS "postFileUrl",
                c.id AS "commentId",
                c.content AS "commentContent",
                c.parent_id AS "parentCommentId"
            FROM follows f
            JOIN comments c ON c.author_id = f.following_id
            JOIN posts p ON p.id = c.post_id
            JOIN users u ON u.id = c.author_id
            WHERE f.follower_id = :currentUserId
            ORDER BY "occurredAt" DESC, "activityType", "activityId" DESC
            """, countQuery = """
            SELECT COUNT(*) FROM (
                SELECT p.id
                FROM follows f
                JOIN posts p ON p.author_id = f.following_id
                WHERE f.follower_id = :currentUserId
                UNION ALL
                SELECT c.id
                FROM follows f
                JOIN comments c ON c.author_id = f.following_id
                WHERE f.follower_id = :currentUserId
            ) activity_count
            """, nativeQuery = true)
    Page<FollowActivityProjection> findActivityFeed(@Param("currentUserId") Long currentUserId,
                                                    Pageable pageable);
}
