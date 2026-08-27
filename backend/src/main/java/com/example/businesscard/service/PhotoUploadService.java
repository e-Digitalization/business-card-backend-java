package com.example.businesscard.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class PhotoUploadService {
    private static final Set<String> ALLOWED = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );
    private static final long MAX_BYTES = 5 * 1024 * 1024;

    private final Path uploadRoot;

    public PhotoUploadService(@Value("${app.upload-dir:uploads}") String uploadDir) throws IOException {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadRoot);
    }

    public String store(MultipartFile file) {
        return store(file, "photos");
    }

    public String store(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose an image to upload.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be under 5 MB.");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!ALLOWED.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use a JPG, PNG, WebP, or GIF image.");
        }

        String ext = switch (contentType) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            default -> "jpg";
        };
        String filename = UUID.randomUUID().toString().replace("-", "") + "." + ext;
        try {
            Path targetDir = uploadRoot.resolve(subfolder);
            Files.createDirectories(targetDir);
            Files.copy(file.getInputStream(), targetDir.resolve(filename));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save image.");
        }

        return "/uploads/" + subfolder + "/" + filename;
    }
}
