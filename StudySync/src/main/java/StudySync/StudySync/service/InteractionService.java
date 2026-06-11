package StudySync.StudySync.service;

import StudySync.StudySync.domain.entity.Interaction;
import StudySync.StudySync.domain.entity.InteractionId;
import StudySync.StudySync.domain.entity.Post;
import StudySync.StudySync.domain.enums.InteractionType;
import StudySync.StudySync.exception.BadRequestException;
import StudySync.StudySync.exception.ResourceNotFoundException;
import StudySync.StudySync.repository.InteractionRepository;
import StudySync.StudySync.repository.PostRepository;
import StudySync.StudySync.util.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InteractionService {

    private final InteractionRepository interactionRepository;
    private final PostRepository postRepository;
    private final UserService userService;
    private final SecurityUtil securityUtil;

    public InteractionService(InteractionRepository interactionRepository,
                              PostRepository postRepository,
                              UserService userService,
                              SecurityUtil securityUtil) {
        this.interactionRepository = interactionRepository;
        this.postRepository = postRepository;
        this.userService = userService;
        this.securityUtil = securityUtil;
    }

    @Transactional
    public void like(Long postId) {
        addInteraction(postId, InteractionType.LIKE);
    }

    @Transactional
    public void unlike(Long postId) {
        removeInteraction(postId, InteractionType.LIKE);
    }

    @Transactional
    public void bookmark(Long postId) {
        addInteraction(postId, InteractionType.BOOKMARK);
    }

    @Transactional
    public void removeBookmark(Long postId) {
        removeInteraction(postId, InteractionType.BOOKMARK);
    }

    public long countLikes(Long postId) {
        return interactionRepository.countByPostIdAndIdType(postId, InteractionType.LIKE);
    }

    public boolean isLikedByUser(Long postId, Long userId) {
        if (userId == null) {
            return false;
        }
        return interactionRepository.existsByIdUserIdAndIdPostIdAndIdType(
                userId, postId, InteractionType.LIKE);
    }

    public boolean isBookmarkedByUser(Long postId, Long userId) {
        if (userId == null) {
            return false;
        }
        return interactionRepository.existsByIdUserIdAndIdPostIdAndIdType(
                userId, postId, InteractionType.BOOKMARK);
    }

    private void addInteraction(Long postId, InteractionType type) {
        Long userId = securityUtil.getCurrentUserIdOrThrow();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        InteractionId id = new InteractionId(userId, postId, type);
        if (interactionRepository.existsById(id)) {
            throw new BadRequestException("Interaction already exists");
        }
        interactionRepository.save(Interaction.builder()
                .id(id)
                .user(userService.getUserOrThrow(userId))
                .post(post)
                .build());
    }

    private void removeInteraction(Long postId, InteractionType type) {
        Long userId = securityUtil.getCurrentUserIdOrThrow();
        InteractionId id = new InteractionId(userId, postId, type);
        if (!interactionRepository.existsById(id)) {
            throw new BadRequestException("Interaction not found");
        }
        interactionRepository.deleteById(id);
    }
}
