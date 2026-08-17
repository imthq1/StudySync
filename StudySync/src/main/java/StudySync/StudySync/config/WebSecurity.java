package StudySync.StudySync.config;

import StudySync.StudySync.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebSecurity implements WebMvcConfigurer {

    private final FileStorageService fileStorageService;
    private final String allowedOrigin;

    public WebSecurity(FileStorageService fileStorageService,
                       @Value("${studysync.cors.allowed-origin:https://main.d1rn6pwilo87ec.amplifyapp.com}") String allowedOrigin) {
        this.fileStorageService = fileStorageService;
        this.allowedOrigin = allowedOrigin;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/v1/**")
                .allowedOrigins(allowedOrigin)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/audio/**")
                .addResourceLocations("file:/app/uploads/audio/");
        registry.addResourceHandler("/uploads/documents/**")
                .addResourceLocations("file:" + fileStorageService.getUploadDir() + "/");
    }
}
