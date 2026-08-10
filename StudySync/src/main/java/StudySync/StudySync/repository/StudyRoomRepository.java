package StudySync.StudySync.repository;

import StudySync.StudySync.domain.entity.StudyRoom;
import StudySync.StudySync.domain.enums.StudyRoomStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudyRoomRepository extends JpaRepository<StudyRoom, Long> {
    List<StudyRoom> findByStatusOrderByCreatedAtDesc(StudyRoomStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select room from StudyRoom room where room.id = :id")
    Optional<StudyRoom> findByIdForUpdate(@Param("id") Long id);
}
