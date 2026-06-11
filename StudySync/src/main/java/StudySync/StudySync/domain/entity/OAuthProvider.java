package StudySync.StudySync.domain.entity;

import StudySync.StudySync.domain.enums.OAuthProviderType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "oauth_providers", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"provider", "provider_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OAuthProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OAuthProviderType provider;

    @Column(name = "provider_id", nullable = false)
    private String providerId;
}
