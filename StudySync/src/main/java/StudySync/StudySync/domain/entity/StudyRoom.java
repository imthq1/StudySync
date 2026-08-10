package StudySync.StudySync.domain.entity;

import StudySync.StudySync.domain.enums.StudyRoomStatus;
import StudySync.StudySync.domain.enums.TimerMode;
import StudySync.StudySync.domain.enums.TimerStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "study_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 120)
    @NotBlank
    @Size(max = 120)
    private String name;

    @Column(length = 160)
    @Size(max = 160)
    private String topic;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StudyRoomStatus status = StudyRoomStatus.ACTIVE;

    @Column(name = "max_members", nullable = false)
    @Min(2)
    @Max(50)
    private Integer maxMembers;

    @Column(name = "focus_duration_minutes", nullable = false)
    @Min(1)
    @Max(120)
    @Builder.Default
    private Integer focusDurationMinutes = 25;

    @Column(name = "break_duration_minutes", nullable = false)
    @Min(1)
    @Max(60)
    @Builder.Default
    private Integer breakDurationMinutes = 5;

    @Enumerated(EnumType.STRING)
    @Column(name = "timer_mode", nullable = false, length = 20)
    @Builder.Default
    private TimerMode timerMode = TimerMode.FOCUS;

    @Enumerated(EnumType.STRING)
    @Column(name = "timer_status", nullable = false, length = 20)
    @Builder.Default
    private TimerStatus timerStatus = TimerStatus.IDLE;

    @Column(name = "timer_ends_at")
    private Instant timerEndsAt;

    @Column(name = "timer_remaining_seconds", nullable = false)
    private Integer timerRemainingSeconds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (status == null) status = StudyRoomStatus.ACTIVE;
        if (focusDurationMinutes == null) focusDurationMinutes = 25;
        if (breakDurationMinutes == null) breakDurationMinutes = 5;
        if (timerMode == null) timerMode = TimerMode.FOCUS;
        if (timerStatus == null) timerStatus = TimerStatus.IDLE;
        if (timerRemainingSeconds == null) timerRemainingSeconds = focusDurationMinutes * 60;
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
