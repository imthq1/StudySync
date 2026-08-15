package StudySync.StudySync.config;


import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class SecurityConfiguration {

    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final ObjectProvider<AuthenticationSuccessHandler> oAuth2LoginSuccessHandler;
    private final ObjectProvider<ClientRegistrationRepository> clientRegistrationRepository;

    public SecurityConfiguration(CustomAuthenticationEntryPoint customAuthenticationEntryPoint,
                                 ObjectProvider<AuthenticationSuccessHandler> oAuth2LoginSuccessHandler,
                                 ObjectProvider<ClientRegistrationRepository> clientRegistrationRepository) {
        this.customAuthenticationEntryPoint = customAuthenticationEntryPoint;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        String[] whiteList = {
                "/",
                "/api/v1/auth/**",
                "/oauth2/**",
                "/login/oauth2/**",
                "/actuator/**",
                "/swagger-ui/**",
                "/v3/**",
                "/swagger-ui.html",
                "/v3/api-docs"
        };
        http
                .csrf(c -> c.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(whiteList).permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/study-rooms", "/api/v1/study-rooms/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/search", "/api/v1/follows/feed").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/me/profile", "/api/v1/users/me/contributions", "/api/v1/users/me/statistics").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/*/profile").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/follows/*/followers").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/follows/*/following").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/posts/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/posts/bookmarked", "/api/v1/posts/liked").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/comments/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/posts").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/posts/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/posts/*/comments").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/tags/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/documents/**").permitAll()
                        .anyRequest().authenticated());
        if (clientRegistrationRepository.getIfAvailable() != null) {
            http.oauth2Login(oauth2 -> oauth2.successHandler(oAuth2LoginSuccessHandler.getObject()));
        }
        http.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults())
                        .authenticationEntryPoint(this.customAuthenticationEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}
