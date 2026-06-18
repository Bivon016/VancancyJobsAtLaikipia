package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.RecruitmentRequest;
import com.CGL.cgl.Model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruitmentRequestRepo extends JpaRepository<RecruitmentRequest, Long> {
    List<RecruitmentRequest> findByDepartment_Id(Long departmentId);
    List<RecruitmentRequest> findByStatus(Status status);
}
