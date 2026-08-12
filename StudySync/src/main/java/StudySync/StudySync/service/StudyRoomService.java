package StudySync.StudySync.service;

import StudySync.StudySync.domain.entity.StudyRoom;
import StudySync.StudySync.domain.entity.StudyRoomMember;
import StudySync.StudySync.domain.entity.StudyRoomMessage;
import StudySync.StudySync.domain.entity.User;
import StudySync.StudySync.domain.enums.*;
import StudySync.StudySync.domain.request.CreateStudyRoomRequest;
import StudySync.StudySync.domain.request.StudyRoomWebRtcSignalRequest;
import StudySync.StudySync.domain.response.*;
import StudySync.StudySync.exception.BadRequestException;
import StudySync.StudySync.exception.ResourceNotFoundException;
import StudySync.StudySync.repository.StudyRoomMemberRepository;
import StudySync.StudySync.repository.StudyRoomMessageRepository;
import StudySync.StudySync.repository.StudyRoomRepository;
import StudySync.StudySync.util.SecurityUtil;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class StudyRoomService {

    private final StudyRoomRepository roomRepository;
    private final StudyRoomMemberRepository memberRepository;
    private final StudyRoomMessageRepository messageRepository;
    private final UserService userService;
    private final SecurityUtil securityUtil;
    private final SimpMessagingTemplate messagingTemplate;

    public StudyRoomService(StudyRoomRepository roomRepository,
                            StudyRoomMemberRepository memberRepository,
                            StudyRoomMessageRepository messageRepository,
                            UserService userService,
                            SecurityUtil securityUtil,
                            SimpMessagingTemplate messagingTemplate) {
        this.roomRepository = roomRepository;
        this.memberRepository = memberRepository;
        this.messageRepository = messageRepository;
        this.userService = userService;
        this.securityUtil = securityUtil;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public StudyRoomResponse create(CreateStudyRoomRequest request) {
        User owner = userService.getUserOrThrow(securityUtil.getCurrentUserIdOrThrow());
        int focusDuration = request.getFocusDurationMinutes() == null ? 25 : request.getFocusDurationMinutes();
        int breakDuration = request.getBreakDurationMinutes() == null ? 5 : request.getBreakDurationMinutes();
        StudyRoom room = StudyRoom.builder()
                .owner(owner)
                .name(request.getName().trim())
                .topic(normalizeOptional(request.getTopic()))
                .description(normalizeOptional(request.getDescription()))
                .maxMembers(request.getMaxMembers())
                .focusDurationMinutes(focusDuration)
                .breakDurationMinutes(breakDuration)
                .timerRemainingSeconds(focusDuration * 60)
                .build();
        roomRepository.save(room);
        memberRepository.save(StudyRoomMember.builder().room(room).user(owner).build());
        return toResponse(room, true);
    }

    @Transactional(readOnly = true)
    public List<StudyRoomResponse> listActive() {
        return roomRepository.findByStatusOrderByCreatedAtDesc(StudyRoomStatus.ACTIVE).stream()
                .map(room -> toResponse(room, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public StudyRoomResponse getDetail(Long roomId) {
        return toResponse(getActiveRoom(roomId), true);
    }

    @Transactional(readOnly = true)
    public List<StudyRoomMessageResponse> getMessages(Long roomId) {
        getActiveRoom(roomId);
        ensureMember(roomId, securityUtil.getCurrentUserIdOrThrow());
        return getRecentMessages(roomId);
    }

    @Transactional
    public StudyRoomResponse join(Long roomId) {
        Long userId = securityUtil.getCurrentUserIdOrThrow();
        StudyRoom room = getActiveRoomForUpdate(roomId);
        StudyRoomMember existing = memberRepository.findByRoomIdAndUserId(roomId, userId).orElse(null);
        if (existing != null) return toResponse(room, true);
        if (memberRepository.countByRoomId(roomId) >= room.getMaxMembers()) {
            throw new BadRequestException("Study room is full");
        }

        User user = userService.getUserOrThrow(userId);
        memberRepository.saveAndFlush(StudyRoomMember.builder().room(room).user(user).build());
        publish(roomId, StudyRoomEventType.MEMBER_JOINED, toMemberResponse(user));
        return toResponse(room, true);
    }

    @Transactional
    public void leave(Long roomId) {
        Long userId = securityUtil.getCurrentUserIdOrThrow();
        StudyRoom room = getActiveRoomForUpdate(roomId);
        if (room.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Room owner must close the active room instead of leaving");
        }
        StudyRoomMember member = memberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new BadRequestException("User is not a member of this study room"));
        StudyRoomMemberResponse memberResponse = toMemberResponse(member.getUser());
        memberRepository.delete(member);
        memberRepository.flush();
        publish(roomId, StudyRoomEventType.MEMBER_LEFT, memberResponse);
    }

    @Transactional
    public void close(Long roomId) {
        Long userId = securityUtil.getCurrentUserIdOrThrow();
        StudyRoom room = getActiveRoomForUpdate(roomId);
        ensureOwner(room, userId);
        room.setStatus(StudyRoomStatus.CLOSED);
        room.setTimerStatus(TimerStatus.IDLE);
        room.setTimerEndsAt(null);
        roomRepository.save(room);
        publish(roomId, StudyRoomEventType.ROOM_CLOSED, StudyRoomStatus.CLOSED);
    }

    @Transactional
    public StudyRoomMessageResponse sendMessage(Long roomId, Long userId, String content) {
        StudyRoom room = getActiveRoom(roomId);
        ensureMember(roomId, userId);
        User sender = userService.getUserOrThrow(userId);
        StudyRoomMessage message = messageRepository.save(StudyRoomMessage.builder()
                .room(room)
                .sender(sender)
                .content(content.trim())
                .build());
        StudyRoomMessageResponse response = toMessageResponse(message);
        publish(roomId, StudyRoomEventType.CHAT_MESSAGE, response);
        return response;
    }

    @Transactional
    public StudyRoomTimerResponse updateTimer(Long roomId, Long userId, TimerAction action) {
        StudyRoom room = getActiveRoomForUpdate(roomId);
        ensureOwner(room, userId);
        Instant now = Instant.now();
        switch (action) {
            case START_FOCUS -> startTimer(room, TimerMode.FOCUS, room.getFocusDurationMinutes(), now);
            case START_BREAK -> startTimer(room, TimerMode.BREAK, room.getBreakDurationMinutes(), now);
            case PAUSE -> pauseTimer(room, now);
            case RESET -> {
                room.setTimerMode(TimerMode.FOCUS);
                room.setTimerStatus(TimerStatus.IDLE);
                room.setTimerEndsAt(null);
                room.setTimerRemainingSeconds(room.getFocusDurationMinutes() * 60);
            }
        }
        roomRepository.save(room);
        StudyRoomTimerResponse response = toTimerResponse(room);
        publish(roomId, StudyRoomEventType.TIMER_UPDATED, response);
        return response;
    }

    @Transactional(readOnly = true)
    public void relayWebRtcSignal(Long roomId, Long senderId, StudyRoomWebRtcSignalRequest request) {
        getActiveRoom(roomId);
        ensureMember(roomId, senderId);

        boolean directedSignal = request.getSignalType() != StudyRoomWebRtcSignalType.CAMERA_STATE;
        if (directedSignal) {
            if (request.getTargetUserId() == null) {
                throw new BadRequestException("Target user is required for WebRTC signaling");
            }
            if (request.getTargetUserId().equals(senderId)) {
                throw new BadRequestException("Cannot send a WebRTC signal to yourself");
            }
            ensureMember(roomId, request.getTargetUserId());
        }

        switch (request.getSignalType()) {
            case OFFER, ANSWER -> {
                if (request.getSdp() == null || request.getSdp().isBlank()) {
                    throw new BadRequestException("SDP is required for offer and answer signals");
                }
            }
            case ICE_CANDIDATE -> {
                if (request.getCandidate() == null || request.getCandidate().isBlank()) {
                    throw new BadRequestException("ICE candidate is required");
                }
            }
            case CAMERA_STATE -> {
                if (request.getCameraEnabled() == null) {
                    throw new BadRequestException("Camera state is required");
                }
            }
        }

        StudyRoomWebRtcSignalResponse response = StudyRoomWebRtcSignalResponse.builder()
                .signalType(request.getSignalType())
                .fromUserId(senderId)
                .targetUserId(request.getTargetUserId())
                .sdp(request.getSdp())
                .candidate(request.getCandidate())
                .sdpMid(request.getSdpMid())
                .sdpMLineIndex(request.getSdpMLineIndex())
                .usernameFragment(request.getUsernameFragment())
                .cameraEnabled(request.getCameraEnabled())
                .build();
        publish(roomId, StudyRoomEventType.WEBRTC_SIGNAL, response);
    }

    private void startTimer(StudyRoom room, TimerMode mode, int durationMinutes, Instant now) {
        int durationSeconds = durationMinutes * 60;
        room.setTimerMode(mode);
        room.setTimerStatus(TimerStatus.RUNNING);
        room.setTimerRemainingSeconds(durationSeconds);
        room.setTimerEndsAt(now.plusSeconds(durationSeconds));
    }

    private void pauseTimer(StudyRoom room, Instant now) {
        if (room.getTimerStatus() != TimerStatus.RUNNING || room.getTimerEndsAt() == null) {
            throw new BadRequestException("Timer is not running");
        }
        long remaining = Math.max(0, Duration.between(now, room.getTimerEndsAt()).getSeconds());
        room.setTimerRemainingSeconds((int) remaining);
        room.setTimerStatus(TimerStatus.PAUSED);
        room.setTimerEndsAt(null);
    }

    private StudyRoom getActiveRoom(Long roomId) {
        StudyRoom room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Study room not found"));
        ensureActive(room);
        return room;
    }

    private StudyRoom getActiveRoomForUpdate(Long roomId) {
        StudyRoom room = roomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Study room not found"));
        ensureActive(room);
        return room;
    }

    private void ensureActive(StudyRoom room) {
        if (room.getStatus() != StudyRoomStatus.ACTIVE) {
            throw new BadRequestException("Study room is closed");
        }
    }

    private void ensureMember(Long roomId, Long userId) {
        if (!memberRepository.existsByRoomIdAndUserId(roomId, userId)) {
            throw new BadRequestException("User is not a member of this study room");
        }
    }

    private void ensureOwner(StudyRoom room, Long userId) {
        if (!room.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Only the room owner can perform this action");
        }
    }

    private StudyRoomResponse toResponse(StudyRoom room, boolean includeDetail) {
        Long currentUserId = SecurityUtil.getCurrentUserId().orElse(null);
        boolean isMember = currentUserId != null
                && memberRepository.existsByRoomIdAndUserId(room.getId(), currentUserId);
        boolean isOwner = currentUserId != null && room.getOwner().getId().equals(currentUserId);
        List<StudyRoomMemberResponse> members = includeDetail
                ? memberRepository.findByRoomIdOrderByJoinedAtAsc(room.getId()).stream()
                .map(member -> toMemberResponse(member.getUser())).toList()
                : List.of();
        return StudyRoomResponse.builder()
                .id(room.getId())
                .owner(toMemberResponse(room.getOwner()))
                .name(room.getName())
                .topic(room.getTopic())
                .description(room.getDescription())
                .status(room.getStatus())
                .maxMembers(room.getMaxMembers())
                .memberCount((int) memberRepository.countByRoomId(room.getId()))
                .isMember(isMember)
                .isOwner(isOwner)
                .focusDurationMinutes(room.getFocusDurationMinutes())
                .breakDurationMinutes(room.getBreakDurationMinutes())
                .timerMode(room.getTimerMode())
                .timerStatus(room.getTimerStatus())
                .timerEndsAt(room.getTimerEndsAt())
                .timerRemainingSeconds(room.getTimerRemainingSeconds())
                .members(members)
                .messages(includeDetail && isMember ? getRecentMessages(room.getId()) : List.of())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }

    private List<StudyRoomMessageResponse> getRecentMessages(Long roomId) {
        List<StudyRoomMessage> messages = new ArrayList<>(
                messageRepository.findTop100ByRoomIdOrderByCreatedAtDesc(roomId));
        messages.sort(Comparator.comparing(StudyRoomMessage::getCreatedAt)
                .thenComparing(StudyRoomMessage::getId));
        return messages.stream().map(this::toMessageResponse).toList();
    }

    private StudyRoomMemberResponse toMemberResponse(User user) {
        return StudyRoomMemberResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    private StudyRoomMessageResponse toMessageResponse(StudyRoomMessage message) {
        return StudyRoomMessageResponse.builder()
                .id(message.getId())
                .roomId(message.getRoom().getId())
                .sender(toMemberResponse(message.getSender()))
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private StudyRoomTimerResponse toTimerResponse(StudyRoom room) {
        return StudyRoomTimerResponse.builder()
                .timerMode(room.getTimerMode())
                .timerStatus(room.getTimerStatus())
                .timerEndsAt(room.getTimerEndsAt())
                .timerRemainingSeconds(room.getTimerRemainingSeconds())
                .focusDurationMinutes(room.getFocusDurationMinutes())
                .breakDurationMinutes(room.getBreakDurationMinutes())
                .build();
    }

    private void publish(Long roomId, StudyRoomEventType type, Object data) {
        messagingTemplate.convertAndSend("/topic/study-rooms/" + roomId, StudyRoomEvent.builder()
                .type(type)
                .roomId(roomId)
                .occurredAt(Instant.now())
                .data(data)
                .build());
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
