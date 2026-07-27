package StudySync.StudySync.service;

import StudySync.StudySync.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "ppt", "pptx", "doc", "docx", "png", "jpg", "jpeg", "gif", "webp"
    );

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucket;
    private final String keyPrefix;
    private final Duration downloadUrlDuration;
    private final Path uploadDir;

    public FileStorageService(S3Client s3Client,
                              S3Presigner s3Presigner,
                              @Value("${studysync.aws.s3.bucket}") String bucket,
                              @Value("${studysync.aws.s3.key-prefix:documents}") String keyPrefix,
                              @Value("${studysync.aws.s3.presigned-url-minutes:15}") long presignedUrlMinutes,
                              @Value("${studysync.upload.dir:uploads/documents}") String uploadDir) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.bucket = bucket;
        this.keyPrefix = keyPrefix.replaceAll("^/+|/+$", "");
        this.downloadUrlDuration = Duration.ofMinutes(presignedUrlMinutes);
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) {
        if (bucket == null || bucket.isBlank()) {
            throw new BadRequestException("S3 bucket is not configured. Set AWS_S3_BUCKET");
        }
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("File type not allowed. Allowed: PDF, Slide, Image");
        }

        String key = keyPrefix + "/" + UUID.randomUUID() + "." + extension;
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();

        try {
            s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return key;
        } catch (S3Exception ex) {
            String errorCode = ex.awsErrorDetails() == null ? "UnknownS3Error" : ex.awsErrorDetails().errorCode();
            log.error("S3 rejected upload to bucket '{}' with error {}", bucket, errorCode, ex);
            throw new BadRequestException("S3 rejected the upload: " + errorCode);
        } catch (SdkClientException ex) {
            log.error("Unable to connect or authenticate to S3 bucket '{}'", bucket, ex);
            throw new BadRequestException("Cannot connect to S3. Check AWS credentials and region");
        } catch (IOException ex) {
            log.error("Unable to read multipart file before S3 upload", ex);
            throw new BadRequestException("Failed to read uploaded file");
        }
    }

    public void deleteByUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        if (fileUrl.startsWith("/uploads/documents/")) {
            deleteLegacyLocalFile(fileUrl);
            return;
        }

        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileUrl)
                    .build());
        } catch (SdkException ignored) {
            // best-effort cleanup
        }
    }

    public String createDownloadUrl(String objectKey) {
        if (objectKey == null || objectKey.isBlank() || objectKey.startsWith("/uploads/documents/")
                || objectKey.startsWith("http://") || objectKey.startsWith("https://")) {
            return objectKey;
        }

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .build();
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(downloadUrlDuration)
                .getObjectRequest(getObjectRequest)
                .build();

        try {
            return s3Presigner.presignGetObject(presignRequest).url().toString();
        } catch (SdkException ex) {
            throw new BadRequestException("Failed to create file download URL");
        }
    }

    private void deleteLegacyLocalFile(String fileUrl) {
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
