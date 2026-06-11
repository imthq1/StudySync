package StudySync.StudySync.service;

import StudySync.StudySync.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "ppt", "pptx", "doc", "docx", "png", "jpg", "jpeg", "gif", "webp"
    );

    private final Path uploadDir;

    public FileStorageService(@Value("${studysync.upload.dir:uploads/documents}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("File type not allowed. Allowed: PDF, Slide, Image");
        }

        try {
            Files.createDirectories(uploadDir);
            String storedName = UUID.randomUUID() + "." + extension;
            Path target = uploadDir.resolve(storedName);
            file.transferTo(target);
            return "/uploads/documents/" + storedName;
        } catch (IOException ex) {
            throw new BadRequestException("Failed to store file: " + ex.getMessage());
        }
    }

    public void deleteByUrl(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/documents/")) {
            return;
        }
        String filename = fileUrl.substring("/uploads/documents/".length());
        try {
            Files.deleteIfExists(uploadDir.resolve(filename));
        } catch (IOException ignored) {
            // best-effort cleanup
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    public Path getUploadDir() {
        return uploadDir;
    }
}
