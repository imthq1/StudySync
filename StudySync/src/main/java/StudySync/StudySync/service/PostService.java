package StudySync.StudySync.service;

import StudySync.StudySync.domain.entity.Post;
import StudySync.StudySync.domain.entity.User;
import StudySync.StudySync.domain.enums.ContentType;
import StudySync.StudySync.domain.enums.InteractionType;
import StudySync.StudySync.domain.request.CreatePostRequest;
import StudySync.StudySync.domain.request.UpdatePostRequest;
import StudySync.StudySync.domain.response.PostResponse;
import StudySync.StudySync.exception.BadRequestException;
import StudySync.StudySync.exception.ResourceNotFoundException;
import StudySync.StudySync.repository.CommentRepository;
import StudySync.StudySync.repository.PostRepository;
import StudySync.StudySync.util.PostMapper;
import StudySync.StudySync.util.SecurityUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserService userService;
    private final TagService tagService;
    private final FileStorageService fileStorageService;
    private final InteractionService interactionService;
    private final SecurityUtil securityUtil;

    public PostService(PostRepository postRepository,
                       CommentRepository commentRepository,
                       UserService userService,
                       TagService tagService,
                       FileStorageService fileStorageService,
                       InteractionService interactionService,
                       SecurityUtil securityUtil) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.userService = userService;
        this.tagService = tagService;
        this.fileStorageService = fileStorageService;
        this.interactionService = interactionService;
        this.securityUtil = securityUtil;
    }

    public Post getPostOrThrow(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
    }

    @Transactional(readOnly = true)
    public PostResponse getById(Long id) {
        Post post = getPostOrThrow(id);
        return toResponse(post);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> list(String tag, String keyword, ContentType contentType, Pageable pageable) {
        Page<Post> page;
        if (tag != null && !tag.isBlank()) {
            page = postRepository.findByTagName(TagService.normalizeTagName(tag), pageable);
        } else if (keyword != null && !keyword.isBlank()) {
            page = postRepository.searchByKeyword(keyword.trim(), pageable);
        } else if (contentType != null) {
            page = postRepository.findByContentType(contentType, pageable);
        } else {
            page = postRepository.findAll(pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getMyPosts(Pageable pageable) {
        Long userId = securityUtil.getCurrentUserIdOrThrow();
        return postRepository.findByAuthorId(userId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getBookmarkedPosts(Pageable pageable) {
        Long userId = securityUtil.getCurrentUserIdOrThrow();
        return postRepository.findBookmarkedByUserId(userId, InteractionType.BOOKMARK, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public PostResponse create(CreatePostRequest request) {
        Long userId = securityUtil.getCurrentUserIdOrThrow();
        User author = userService.getUserOrThrow(userId);

        Post post = Post.builder()
                .author(author)
                .title(request.getTitle())
                .content(request.getContent())
                .contentType(request.getContentType())
                .tags(tagService.resolveTags(request.getTagNames()))
                .build();

        return toResponse(postRepository.save(post));
    }

    @Transactional
    public void uploadFile(MultipartFile file) {
        fileStorageService.store(file);
    }

    @Transactional
    public PostResponse update(Long id, UpdatePostRequest request) {
        Post post = getPostOrThrow(id);
        ensureAuthor(post);

        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getTagNames() != null) {
            post.getTags().clear();
            post.getTags().addAll(tagService.resolveTags(request.getTagNames()));
        }
        return toResponse(postRepository.save(post));
    }

    @Transactional
    public void delete(Long id) {
        Post post = getPostOrThrow(id);
        ensureAuthor(post);
        if (post.getFileUrl() != null) {
            fileStorageService.deleteByUrl(post.getFileUrl());
        }
        postRepository.delete(post);
    }

    private void ensureAuthor(Post post) {
        Long currentUserId = securityUtil.getCurrentUserIdOrThrow();
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new BadRequestException("Only the author can modify this post");
        }
    }

    private PostResponse toResponse(Post post) {
        Long currentUserId = SecurityUtil.getCurrentUserId().orElse(null);
        long likeCount = interactionService.countLikes(post.getId());
        long commentCount = commentRepository.countByPostId(post.getId());
        boolean liked = interactionService.isLikedByUser(post.getId(), currentUserId);
        boolean bookmarked = interactionService.isBookmarkedByUser(post.getId(), currentUserId);
        PostResponse response = PostMapper.toResponse(post, likeCount, commentCount, liked, bookmarked);
        response.setFileUrl(fileStorageService.createDownloadUrl(post.getFileUrl()));
        return response;
    }
}
