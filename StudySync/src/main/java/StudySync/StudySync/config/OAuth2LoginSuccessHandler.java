package StudySync.StudySync.config;

import StudySync.StudySync.domain.entity.OAuthProvider;
import StudySync.StudySync.domain.entity.User;
import StudySync.StudySync.domain.enums.OAuthProviderType;
import StudySync.StudySync.domain.response.ResLoginDTO;
import StudySync.StudySync.repository.OAuthProviderRepository;
import StudySync.StudySync.repository.UserRepository;
import StudySync.StudySync.util.SecurityUtil;
import StudySync.StudySync.util.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Component
@ConditionalOnBean(ClientRegistrationRepository.class)
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final OAuthProviderRepository oauthProviderRepository;
    private final SecurityUtil securityUtil;
    private final PasswordEncoder passwordEncoder;

    @Value("${studysync.oauth.redirect-uri:http://localhost:3000/oauth/callback}")
    private String redirectUri;

    public OAuth2LoginSuccessHandler(UserRepository userRepository,
                                     OAuthProviderRepository oauthProviderRepository,
                                     SecurityUtil securityUtil,
                                     PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.oauthProviderRepository = oauthProviderRepository;
        this.securityUtil = securityUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String registrationId = resolveProvider(request);
        OAuthProviderType providerType = "github".equals(registrationId)
                ? OAuthProviderType.GITHUB : OAuthProviderType.GOOGLE;

        String rawEmail = oauthUser.getAttribute("email");
        final String email = rawEmail != null ? rawEmail
                : oauthUser.getAttribute("login") + "@github.local";
        String rawName = oauthUser.getAttribute("name");
        if (rawName == null) {
            rawName = oauthUser.getAttribute("login");
        }
        final String displayName = rawName;
        final String providerId = String.valueOf(oauthUser.getAttributes().getOrDefault("sub",
                oauthUser.getAttributes().get("id")));

        User user = userRepository.findByEmail(email).orElseGet(() -> userRepository.save(User.builder()
                .email(email)
                .fullName(displayName != null ? displayName : email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .build()));

        oauthProviderRepository.findByProviderAndProviderId(providerType, providerId)
                .orElseGet(() -> oauthProviderRepository.save(OAuthProvider.builder()
                        .user(user)
                        .provider(providerType)
                        .providerId(providerId)
                        .build()));

        ResLoginDTO dto = new ResLoginDTO();
        dto.setUserLogin(UserMapper.toUserLogin(user));
        String access = securityUtil.createAcessToken(user.getEmail(), dto);
        String refresh = securityUtil.createRefreshToken(user.getEmail(), dto);

        String url = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("access_token", access)
                .queryParam("refresh_token", refresh)
                .build().toUriString();
        response.sendRedirect(url);
    }

    private String resolveProvider(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri.contains("github")) {
            return "github";
        }
        return "google";
    }
}
