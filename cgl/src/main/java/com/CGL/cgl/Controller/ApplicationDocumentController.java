package com.CGL.cgl.Controller;

import com.CGL.cgl.Model.ApplicationDocument;
import com.CGL.cgl.Model.DocumentType;
import com.CGL.cgl.Service.ApplicationDocumentService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/documents")
public class ApplicationDocumentController {

    private final ApplicationDocumentService applicationDocumentService;

    public ApplicationDocumentController(
        ApplicationDocumentService applicationDocumentService
    ) {
        this.applicationDocumentService = applicationDocumentService;
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<ApplicationDocument> uploadDocument(
        @RequestParam("file") MultipartFile file,
        @RequestParam("documentType") DocumentType documentType,
        @RequestParam("applicationId") Long applicationId
    ) {
        ApplicationDocument document =
            applicationDocumentService.uploadDocument(
                file,
                documentType,
                applicationId
            );

        return ResponseEntity.ok(document);
    }

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CPSB_ADMIN','HR_OFFICER')")
    public ResponseEntity<List<ApplicationDocument>> getApplicationDocuments(
        @PathVariable Long applicationId
    ) {
        List<ApplicationDocument> documents =
            applicationDocumentService.getApplicationDocuments(applicationId);

        return ResponseEntity.ok(documents);
    }

    @GetMapping("/my/{applicationId}")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<List<ApplicationDocument>> getMyDocuments(
        @PathVariable Long applicationId
    ) {
        String email =
            org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return ResponseEntity.ok(
            applicationDocumentService.getMyApplicationDocuments(
                applicationId,
                email
            )
        );
    }
}
