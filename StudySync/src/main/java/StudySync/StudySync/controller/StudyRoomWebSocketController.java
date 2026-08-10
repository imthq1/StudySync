package StudySync.StudySync.controller;

import StudySync.StudySync.domain.request.StudyRoomMessageRequest;
import StudySync.StudySync.domain.request.StudyRoomTimerRequest;
import StudySync.StudySync.exception.BadRequestException;
import StudySync.StudySync.service.StudyRoomService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class StudyRoomWebSocketController {

    private final StudyRoomService studyRoomService;

    public StudyRoomWebSocketController(StudyRoomService studyRoomService) {
        this.studyRoomService = studyRoomService;
    }

    @MessageMapping("/study-rooms/{roomId}/messages")
    public void sendMessage(@DestinationVariable Long roomId,
                            @Valid @Payload StudyRoomMessageRequest request,
                            JwtAuthenticationToken authentication) {
        studyRoomService.sendMessage(roomId, extractUserId(authentication), request.getContent());
    }

    @MessageMapping("/study-rooms/{roomId}/timer")
    public void updateTimer(@DestinationVariable Long roomId,
                            @Valid @Payload StudyRoomTimerRequest request,
                            JwtAuthenticationToken authentication) {
        studyRoomService.updateTimer(roomId, extractUserId(authentication), request.getAction());
    }

    private Long extractUserId(JwtAuthenticationToken authentication) {
        if (authentication == null) throw new BadRequestException("User not authenticated");
        Jwt jwt = authentication.getToken();
        Object userClaim = jwt.getClaim("user");
        if (userClaim instanceof Map<?, ?> map) {
            Object id = map.get("id");
            if (id instanceof Number number) return number.longValue();
            if (id instanceof String value) {
                try {
                    return Long.valueOf(value);
                } catch (NumberFormatException ignored) {
                    // Fall through to the authentication error below.
                }
            }
        }
        throw new BadRequestException("JWT user.id claim is missing or invalid");
    }
}
