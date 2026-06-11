package StudySync.StudySync.util;

import StudySync.StudySync.domain.entity.User;
import StudySync.StudySync.domain.response.ResLoginDTO;
import StudySync.StudySync.domain.response.UserResponse;

public final class UserMapper {

    private UserMapper() {}

    public static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .learningGoals(user.getLearningGoals())
                .reputationPoints(user.getReputationPoints())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static ResLoginDTO.UserLogin toUserLogin(User user) {
        ResLoginDTO.UserLogin login = new ResLoginDTO.UserLogin();
        login.setId(user.getId());
        login.setEmail(user.getEmail());
        login.setName(user.getFullName());
        return login;
    }
}
