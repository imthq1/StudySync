package StudySync.StudySync.service;

import StudySync.StudySync.domain.entity.Tag;
import StudySync.StudySync.domain.response.TagResponse;
import StudySync.StudySync.repository.TagRepository;
import StudySync.StudySync.util.TagMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public List<TagResponse> getAll() {
        return tagRepository.findAll().stream()
                .map(TagMapper::toResponse)
                .toList();
    }

    public List<TagResponse> search(String name) {
        return tagRepository.findByNameContainingIgnoreCase(normalizeTagName(name)).stream()
                .map(TagMapper::toResponse)
                .toList();
    }

    @Transactional
    public Set<Tag> resolveTags(List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        if (tagNames == null) {
            return tags;
        }
        for (String rawName : tagNames) {
            String name = normalizeTagName(rawName);
            if (name.isBlank()) {
                continue;
            }
            Tag tag = tagRepository.findByNameIgnoreCase(name)
                    .orElseGet(() -> tagRepository.save(Tag.builder().name(name).build()));
            tags.add(tag);
        }
        return tags;
    }

    public static String normalizeTagName(String name) {
        if (name == null) {
            return "";
        }
        String trimmed = name.trim();
        if (trimmed.startsWith("#")) {
            return trimmed.substring(1).trim();
        }
        return trimmed;
    }
}
