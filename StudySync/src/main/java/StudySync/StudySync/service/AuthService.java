package StudySync.StudySync.service;

import StudySync.StudySync.domain.entity.User;
import StudySync.StudySync.domain.request.LoginRequest;
import StudySync.StudySync.domain.request.RegisterRequest;
import StudySync.StudySync.domain.response.ResLoginDTO;
import StudySync.StudySync.domain.response.TokenResponse;
import StudySync.StudySync.exception.BadRequestException;
import StudySync.StudySync.exception.ResourceNotFoundException;
import StudySync.StudySync.repository.UserRepository;
import StudySync.StudySync.util.SecurityUtil;
import StudySync.StudySync.util.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       SecurityUtil securityUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityUtil = securityUtil;
    }

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .build();
        userRepository.save(user);
        return buildTokenResponse(user);
    }

    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }
        return buildTokenResponse(user);
    }

    public TokenResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }
        Jwt jwt;
        try {
            jwt = securityUtil.checkValidRefreshToken(refreshToken);
        } catch (JwtException ex) {
            throw new BadRequestException("Refresh token is invalid or expired");
        }
        User user = userRepository.findByEmail(jwt.getSubject())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return buildTokenResponse(user);
    }

    private TokenResponse buildTokenResponse(User user) {
        ResLoginDTO dto = new ResLoginDTO();
        dto.setUserLogin(UserMapper.toUserLogin(user));
        return TokenResponse.builder()
                .accessToken(securityUtil.createAcessToken(user.getEmail(), dto))
                .refreshToken(securityUtil.createRefreshToken(user.getEmail(), dto))
                .user(dto.getUserLogin())
                .build();
    }
}
