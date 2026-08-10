package StudySync.StudySync.controller;

import StudySync.StudySync.domain.request.CreateStudyRoomRequest;
import StudySync.StudySync.domain.response.StudyRoomMessageResponse;
import StudySync.StudySync.domain.response.StudyRoomResponse;
import StudySync.StudySync.service.StudyRoomService;
import StudySync.StudySync.util.ApiMessage;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/study-rooms")
public class StudyRoomController {

    private final StudyRoomService studyRoomService;

    public StudyRoomController(StudyRoomService studyRoomService) {
        this.studyRoomService = studyRoomService;
    }

    @PostMapping
    @ApiMessage("Create study room success")
    public ResponseEntity<StudyRoomResponse> create(@Valid @RequestBody CreateStudyRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studyRoomService.create(request));
    }

    @GetMapping
    @ApiMessage("Fetch active study rooms")
    public ResponseEntity<List<StudyRoomResponse>> list() {
        return ResponseEntity.ok(studyRoomService.listActive());
    }

    @GetMapping("/{roomId}")
    @ApiMessage("Fetch study room")
    public ResponseEntity<StudyRoomResponse> get(@PathVariable Long roomId) {
        return ResponseEntity.ok(studyRoomService.getDetail(roomId));
    }

    @PostMapping("/{roomId}/join")
    @ApiMessage("Join study room success")
    public ResponseEntity<StudyRoomResponse> join(@PathVariable Long roomId) {
        return ResponseEntity.ok(studyRoomService.join(roomId));
    }

    @DeleteMapping("/{roomId}/leave")
    @ApiMessage("Leave study room success")
    public void leave(@PathVariable Long roomId) {
        studyRoomService.leave(roomId);
    }

    @DeleteMapping("/{roomId}")
    @ApiMessage("Close study room success")
    public void close(@PathVariable Long roomId) {
        studyRoomService.close(roomId);
    }

    @GetMapping("/{roomId}/messages")
    @ApiMessage("Fetch study room messages")
    public ResponseEntity<List<StudyRoomMessageResponse>> messages(@PathVariable Long roomId) {
        return ResponseEntity.ok(studyRoomService.getMessages(roomId));
    }
}
