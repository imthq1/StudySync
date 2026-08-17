package StudySync.StudySync.config;

import StudySync.StudySync.repository.StudyRoomMemberRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfiguration implements WebSocketMessageBrokerConfigurer {

    private final JwtDecoder jwtDecoder;
    private final StudyRoomMemberRepository memberRepository;
    private final String[] allowedOrigins;

    public WebSocketConfiguration(JwtDecoder jwtDecoder,
                                  StudyRoomMemberRepository memberRepository,
                                   @Value("${studysync.websocket.allowed-origin:https://main.d1rn6pwilo87ec.amplifyapp.com}") String allowedOrigin) {
        this.jwtDecoder = jwtDecoder;
        this.memberRepository = memberRepository;
        this.allowedOrigins = Arrays.stream(allowedOrigin.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toArray(String[]::new);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOrigins(allowedOrigins);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null) return message;
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authorization = accessor.getFirstNativeHeader("Authorization");
                    if (authorization == null || !authorization.startsWith("Bearer ")) {
                        throw new IllegalArgumentException("Missing Bearer token");
                    }
                    Jwt jwt = jwtDecoder.decode(authorization.substring(7));
                    accessor.setUser(new JwtAuthenticationToken(jwt));
                }
                if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    ensureRoomSubscriptionAllowed(accessor);
                }
                return message;
            }
        });
    }

    private void ensureRoomSubscriptionAllowed(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        String prefix = "/topic/study-rooms/";
        if (destination == null || !destination.startsWith(prefix)) return;

        Long roomId;
        try {
            roomId = Long.valueOf(destination.substring(prefix.length()));
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid study room subscription");
        }

        if (!(accessor.getUser() instanceof JwtAuthenticationToken authentication)) {
            throw new IllegalArgumentException("User not authenticated");
        }
        Object userClaim = authentication.getToken().getClaim("user");
        if (!(userClaim instanceof Map<?, ?> map) || !(map.get("id") instanceof Number userId)
                || !memberRepository.existsByRoomIdAndUserId(roomId, userId.longValue())) {
            throw new IllegalArgumentException("Join the study room before subscribing");
        }
    }
}
