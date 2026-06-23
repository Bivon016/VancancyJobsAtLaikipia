package com.CGL.cgl.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileStorageWebConfig implements WebMvcConfigurer {

    private final String uploadDir;

    public FileStorageWebConfig(@Value("${file.upload-dir}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String normalized = uploadDir.replace("\\", "/");
        if (!normalized.endsWith("/")) {
            normalized = normalized + "/";
        }

        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations("file:./uploads/", "file:" + normalized);
    }
}
