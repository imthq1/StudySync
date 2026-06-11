package StudySync.StudySync.repository;

import StudySync.StudySync.domain.entity.OAuthProvider;
import StudySync.StudySync.domain.enums.OAuthProviderType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OAuthProviderRepository extends JpaRepository<OAuthProvider, Long> {
    Optional<OAuthProvider> findByProviderAndProviderId(OAuthProviderType provider, String providerId);
}
