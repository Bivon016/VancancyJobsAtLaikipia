package com.CGL.cgl.Service;

import com.CGL.cgl.Model.ApplicationDocument;
import com.CGL.cgl.Model.Applications;
import com.CGL.cgl.Repo.ApplicationDocumentRepo;
import com.CGL.cgl.Repo.ApplicationsRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.CGL.cgl.Model.DocumentType;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.List;

@Service
public class ApplicationDocumentServiceImpl implements ApplicationDocumentService {

    private final String uploadDir;
    private final ApplicationDocumentRepo applicationDocumentRepo;
    private final ApplicationsRepo applicationsRepo;

    public ApplicationDocumentServiceImpl(
            ApplicationDocumentRepo applicationDocumentRepo,
            ApplicationsRepo applicationsRepo,
            @Value("${file.upload-dir}") String uploadDir
    ) {
        this.applicationDocumentRepo = applicationDocumentRepo;
        this.applicationsRepo = applicationsRepo;
        this.uploadDir = uploadDir;
    }


    @Override
    public ApplicationDocument uploadDocument(
            MultipartFile file,
            DocumentType documentType,
            Long applicationId
    ) {

        Applications application =
                applicationsRepo.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException("Application not found")
                        );


        try {

            // create folder for this application
            Path applicationFolder =
                    Paths.get(uploadDir, applicationId.toString());


            if (!Files.exists(applicationFolder)) {
                Files.createDirectories(applicationFolder);
            }


            String fileName =
                    System.currentTimeMillis()
                            + "_"
                            + file.getOriginalFilename();

            Path filePath =
                    applicationFolder.resolve(fileName);


            // save actual file
            Files.copy(
                    file.getInputStream(),
                    filePath
            );


            // save database record
            ApplicationDocument document =
                    ApplicationDocument.builder()
                            .application(application)
                            .documentType(documentType)
                            .filePath(
                                    "uploads/documents/"
                                            + applicationId
                                            + "/"
                                            + fileName
                            )
                            .build();


            return applicationDocumentRepo.save(document);


        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to upload file",
                    e
            );
        }
    }


    @Override
    public List<ApplicationDocument> getApplicationDocuments(Long applicationId) {

        Applications application =
                applicationsRepo.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException("Application not found")
                        );


        return applicationDocumentRepo.findByApplication(application);
    }
}