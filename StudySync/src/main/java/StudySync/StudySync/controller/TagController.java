package StudySync.StudySync.controller;

import StudySync.StudySync.domain.response.TagResponse;
import StudySync.StudySync.service.TagService;
import StudySync.StudySync.util.ApiMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    @ApiMessage("Fetch tags")
    public ResponseEntity<List<TagResponse>> getAll() {
        return ResponseEntity.ok(tagService.getAll());
    }

    @GetMapping("/search")
    @ApiMessage("Search tags")
    public ResponseEntity<List<TagResponse>> search(@RequestParam String name) {
        return ResponseEntity.ok(tagService.search(name));
    }
}
