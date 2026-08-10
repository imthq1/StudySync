package StudySync.StudySync.repository;

import StudySync.StudySync.domain.entity.StudyRoomMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyRoomMessageRepository extends JpaRepository<StudyRoomMessage, Long> {
    List<StudyRoomMessage> findTop100ByRoomIdOrderByCreatedAtDesc(Long roomId);
}
