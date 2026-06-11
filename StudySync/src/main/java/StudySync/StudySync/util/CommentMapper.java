package StudySync.StudySync.util;

import StudySync.StudySync.domain.entity.Comment;
import StudySync.StudySync.domain.response.CommentResponse;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class CommentMapper {

    private CommentMapper() {}

    public static CommentResponse toResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(UserMapper.toResponse(comment.getAuthor()))
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .replies(new ArrayList<>())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    public static List<CommentResponse> toTree(List<Comment> comments) {
        Map<Long, CommentResponse> byId = new HashMap<>();
        List<CommentResponse> roots = new ArrayList<>();

        for (Comment comment : comments) {
            byId.put(comment.getId(), toResponse(comment));
        }

        for (Comment comment : comments) {
            CommentResponse node = byId.get(comment.getId());
            if (comment.getParent() == null) {
                roots.add(node);
            } else {
                CommentResponse parent = byId.get(comment.getParent().getId());
                if (parent != null) {
                    parent.getReplies().add(node);
                } else {
                    roots.add(node);
                }
            }
        }
        return roots;
    }
}
