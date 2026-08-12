package StudySync.StudySync.repository;

import StudySync.StudySync.domain.entity.StudyRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudyRoomMemberRepository extends JpaRepository<StudyRoomMember, Long> {
    Optional<StudyRoomMember> findByRoomIdAndUserId(Long roomId, Long userId);
    boolean existsByRoomIdAndUserId(Long roomId, Long userId);
    long countByRoomId(Long roomId);
    List<StudyRoomMember> findByRoomIdOrderByJoinedAtAsc(Long roomId);
    long countByUserId(Long userId);
}
