package StudySync.StudySync.util;

import StudySync.StudySync.domain.entity.Post;
import StudySync.StudySync.domain.response.PostResponse;

public final class PostMapper {

    private PostMapper() {}

    public static PostResponse toResponse(Post post,
                                          long likeCount,
                                          long commentCount,
                                          boolean likedByCurrentUser,
                                          boolean bookmarkedByCurrentUser) {
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .contentType(post.getContentType())
                .fileUrl(post.getFileUrl())
                .author(UserMapper.toResponse(post.getAuthor()))
                .tags(post.getTags().stream().map(TagMapper::toResponse).toList())
                .likeCount(likeCount)
                .commentCount(commentCount)
                .likedByCurrentUser(likedByCurrentUser)
                .bookmarkedByCurrentUser(bookmarkedByCurrentUser)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
