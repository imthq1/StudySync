package StudySync.StudySync.service;

import StudySync.StudySync.domain.entity.Comment;
import StudySync.StudySync.domain.entity.Post;
import StudySync.StudySync.domain.entity.User;
import StudySync.StudySync.domain.request.CreateCommentRequest;
import StudySync.StudySync.domain.request.UpdateCommentRequest;
import StudySync.StudySync.domain.response.CommentResponse;
import StudySync.StudySync.domain.response.CommentActivityResponse;
import StudySync.StudySync.exception.BadRequestException;
import StudySync.StudySync.exception.ResourceNotFoundException;
import StudySync.StudySync.repository.CommentRepository;
import StudySync.StudySync.util.CommentMapper;
import StudySync.StudySync.util.SecurityUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostService postService;
    private final UserService userService;
    private final SecurityUtil securityUtil;

    public CommentService(CommentRepository commentRepository,
                          PostService postService,
                          UserService userService,
                          SecurityUtil securityUtil) {
        this.commentRepository = commentRepository;
        this.postService = postService;
        this.userService = userService;
        this.securityUtil = securityUtil;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getByPostId(Long postId) {
        postService.getPostOrThrow(postId);
        return CommentMapper.toTree(commentRepository.findByPostIdOrderByCreatedAtAsc(postId));
    }

    @Transactional(readOnly = true)
    public Page<CommentActivityResponse> getMyComments(Pageable pageable) {
        Long userId = securityUtil.getCurrentUserIdOrThrow();
        return commentRepository.findByAuthorId(userId, pageable).map(comment -> CommentActivityResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .parentId(comment.getParent() == null ? null : comment.getParent().getId())
                .postId(comment.getPost().getId())
                .postTitle(comment.getPost().getTitle())
                .createdAt(comment.getCreatedAt())
                .build());
    }

    @Transactional
    public CommentResponse create(Long postId, CreateCommentRequest request) {
        Post post = postService.getPostOrThrow(postId);
        Long userId = securityUtil.getCurrentUserIdOrThrow();
        User author = userService.getUserOrThrow(userId);

        Comment parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));
            if (!parent.getPost().getId().equals(postId)) {
                throw new BadRequestException("Parent comment does not belong to this post");
            }
        }

        Comment comment = Comment.builder()
                .post(post)
                .author(author)
                .parent(parent)
                .content(request.getContent().trim())
                .build();

        return CommentMapper.toResponse(commentRepository.save(comment));
    }

    @Transactional
    public CommentResponse update(Long commentId, UpdateCommentRequest request) {
        Comment comment = getCommentOrThrow(commentId);
        ensureAuthor(comment);
        comment.setContent(request.getContent().trim());
        return CommentMapper.toResponse(commentRepository.save(comment));
    }

    @Transactional
    public void delete(Long commentId) {
        Comment comment = getCommentOrThrow(commentId);
        ensureAuthor(comment);
        commentRepository.delete(comment);
    }

    private Comment getCommentOrThrow(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
    }

    private void ensureAuthor(Comment comment) {
        Long currentUserId = securityUtil.getCurrentUserIdOrThrow();
        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new BadRequestException("Only the author can modify this comment");
        }
    }
}
