package com.CGL.cgl.Service;

import com.CGL.cgl.Model.ApplicationDocument;
import com.CGL.cgl.Model.DocumentType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ApplicationDocumentService {

    ApplicationDocument uploadDocument(
            MultipartFile file,
            DocumentType documentType,
            Long applicationId
    );


    List<ApplicationDocument> getApplicationDocuments(Long applicationId);

}