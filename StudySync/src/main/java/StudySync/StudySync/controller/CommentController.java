package StudySync.StudySync.controller;

import StudySync.StudySync.domain.request.CreateCommentRequest;
import StudySync.StudySync.domain.request.UpdateCommentRequest;
import StudySync.StudySync.domain.response.CommentResponse;
import StudySync.StudySync.service.CommentService;
import StudySync.StudySync.util.ApiMessage;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/posts/{postId}/comments")
    @ApiMessage("Fetch comments")
    public ResponseEntity<List<CommentResponse>> list(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getByPostId(postId));
    }

    @PostMapping("/posts/{postId}/comments")
    @ApiMessage("Create comment success")
    public ResponseEntity<CommentResponse> create(@PathVariable Long postId,
                                                  @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(commentService.create(postId, request));
    }

    @PutMapping("/comments/{commentId}")
    @ApiMessage("Update comment success")
    public ResponseEntity<CommentResponse> update(@PathVariable Long commentId,
                                                  @Valid @RequestBody UpdateCommentRequest request) {
        return ResponseEntity.ok(commentService.update(commentId, request));
    }

    @DeleteMapping("/comments/{commentId}")
    @ApiMessage("Delete comment success")
    public void delete(@PathVariable Long commentId) {
        commentService.delete(commentId);
    }
}
