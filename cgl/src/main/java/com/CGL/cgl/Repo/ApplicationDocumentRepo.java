package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.ApplicationDocument;
import com.CGL.cgl.Model.Applications;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationDocumentRepo extends JpaRepository<ApplicationDocument, Long> {

    List<ApplicationDocument> findByApplication(Applications application);

}