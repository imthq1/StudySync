package StudySync.StudySync.controller;

import StudySync.StudySync.service.InteractionService;
import StudySync.StudySync.util.ApiMessage;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/posts/{postId}")
public class InteractionController {

    private final InteractionService interactionService;

    public InteractionController(InteractionService interactionService) {
        this.interactionService = interactionService;
    }

    @PostMapping("/like")
    @ApiMessage("Like post success")
    public void like(@PathVariable Long postId) {
        interactionService.like(postId);
    }

    @DeleteMapping("/like")
    @ApiMessage("Unlike post success")
    public void unlike(@PathVariable Long postId) {
        interactionService.unlike(postId);
    }

    @PostMapping("/bookmark")
    @ApiMessage("Bookmark post success")
    public void bookmark(@PathVariable Long postId) {
        interactionService.bookmark(postId);
    }

    @DeleteMapping("/bookmark")
    @ApiMessage("Remove bookmark success")
    public void removeBookmark(@PathVariable Long postId) {
        interactionService.removeBookmark(postId);
    }
}
