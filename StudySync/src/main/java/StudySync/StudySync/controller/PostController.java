package StudySync.StudySync.controller;

import StudySync.StudySync.domain.enums.ContentType;
import StudySync.StudySync.domain.request.CreatePostRequest;
import StudySync.StudySync.domain.request.UpdatePostRequest;
import StudySync.StudySync.domain.response.PostResponse;
import StudySync.StudySync.service.PostService;
import StudySync.StudySync.util.ApiMessage;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    @ApiMessage("Fetch posts")
    public ResponseEntity<Page<PostResponse>> list(
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ContentType contentType,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(postService.list(tag, keyword, contentType, pageable));
    }

    @GetMapping("/{id}")
    @ApiMessage("Fetch post detail")
    public ResponseEntity<PostResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getById(id));
    }

    @GetMapping("/me")
    @ApiMessage("Fetch my posts")
    public ResponseEntity<Page<PostResponse>> myPosts(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(postService.getMyPosts(pageable));
    }

    @GetMapping("/user/{userId}")
    @ApiMessage("Fetch user posts")
    public ResponseEntity<Page<PostResponse>> userPosts(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(postService.getUserPosts(userId, pageable));
    }

    @GetMapping("/bookmarked")
    @ApiMessage("Fetch bookmarked posts")
    public ResponseEntity<Page<PostResponse>> bookmarked(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(postService.getBookmarkedPosts(pageable));
    }

    @GetMapping("/liked")
    @ApiMessage("Fetch liked posts")
    public ResponseEntity<Page<PostResponse>> liked(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(postService.getLikedPosts(pageable));
    }

    @PostMapping
    @ApiMessage("Create post success")
    public ResponseEntity<PostResponse> create(@Valid @RequestBody CreatePostRequest request) {
        return ResponseEntity.ok(postService.create(request));
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @ApiMessage("Upload document success")
    public ResponseEntity<Void> upload(
            @RequestParam MultipartFile file
      ) {
        postService.uploadFile(file);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @ApiMessage("Update post success")
    public ResponseEntity<PostResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody UpdatePostRequest request) {
        return ResponseEntity.ok(postService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete post success")
    public void delete(@PathVariable Long id) {
        postService.delete(id);
    }
}
