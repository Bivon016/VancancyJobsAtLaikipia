package com.CGL.cgl.Controller;

import com.CGL.cgl.Model.ApplicationDocument;
import com.CGL.cgl.Model.DocumentType;
import com.CGL.cgl.Service.ApplicationDocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/documents")
public class ApplicationDocumentController {


    private final ApplicationDocumentService applicationDocumentService;


    public ApplicationDocumentController(
            ApplicationDocumentService applicationDocumentService
    ) {
        this.applicationDocumentService = applicationDocumentService;
    }


    @PostMapping(
            value = "/upload",
            consumes = "multipart/form-data"
    )    @PreAuthorize("hasRole('APPLICANT')")
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
    @PreAuthorize("hasAnyRole('CPSB_ADMIN','HR_OFFICER')")
    public ResponseEntity<List<ApplicationDocument>> getApplicationDocuments(

            @PathVariable Long applicationId

    ) {


        List<ApplicationDocument> documents =
                applicationDocumentService.getApplicationDocuments(applicationId);


        return ResponseEntity.ok(documents);
    }

}