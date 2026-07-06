package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.RecruitmentRequestDTO;
import com.CGL.cgl.Exception.ConflictException;
import com.CGL.cgl.Exception.ForbiddenException;
import com.CGL.cgl.Exception.ResourceNotFoundException;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.DepartmentRepo;
import com.CGL.cgl.Repo.RecruitmentRequestRepo;
import com.CGL.cgl.Repo.UserRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RecruuitmentRequestService {

    private final RecruitmentRequestRepo recruitmentRequestRepo;
    private final DepartmentRepo departmentRepo;
    private final UserRepo userRepo;
    private final NotificationService notificationService;


    public RecruuitmentRequestService (RecruitmentRequestRepo recruitmentRequestRepo, DepartmentRepo departmentRepo, UserRepo userRepo, NotificationService notificationService) {
        this.recruitmentRequestRepo = recruitmentRequestRepo;
        this.departmentRepo = departmentRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
    }

    public RecruitmentRequest submitRequest(RecruitmentRequestDTO request, String email) {
        Users head = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (head.getRole() != Role.DEPT_HEAD) {
            throw new ForbiddenException("User is not a department Head");
        }
        Departments department = departmentRepo.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        if (!department.getDepartmentHead().getId().equals(head.getId())) {
            throw new ForbiddenException("You can only submit requests for your own department");
        }
        RecruitmentRequest recruitmentRequest = RecruitmentRequest.builder()
                .department(department)
                .requestedBy(head)
                .jobTitle(request.getJobTitle())
                .numberOfPositions(request.getNumberOfPositions())
                .reason(request.getReason())
                .requirements(request.getRequirements())
                .jobDescription(request.getJobDescription())
                .status(Status.PENDING)
                .build();
        return recruitmentRequestRepo.save(recruitmentRequest);
    }
    public RecruitmentRequest approveRequest(Long requestId, String email) {
        Users approver = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RecruitmentRequest request = recruitmentRequestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruitment request not found"));


        if (approver.getRole() != Role.CPSB_ADMIN) {
            throw new ForbiddenException("Only CPSB Admin can approve requests");
        }

        if (request.getStatus() != Status.PENDING) {
            throw new ConflictException("Request has already been processed");
        }

        request.setStatus(Status.APPROVED);
        request.setApprovedDate(LocalDateTime.now());

        RecruitmentRequest saved = recruitmentRequestRepo.save(request);

        notificationService.createNotification(
                request.getRequestedBy(),
                "Recruitment Request Approved",
                "Your request for " + request.getJobTitle() + " has been approved."
        );

        return saved;
    }
    public RecruitmentRequest rejectRequest(Long requestId, String email) {

        RecruitmentRequest request = recruitmentRequestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruitment request not found"));

        Users approver = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (approver.getRole() != Role.CPSB_ADMIN) {
            throw new ForbiddenException("Only CPSB Admin can reject requests");
        }

        if (request.getStatus() != Status.PENDING) {
            throw new ConflictException("Request has already been processed");
        }

        request.setStatus(Status.REJECTED);

        RecruitmentRequest saved = recruitmentRequestRepo.save(request);

        notificationService.createNotification(
                request.getRequestedBy(),
                "Recruitment Request Rejected",
                "Your request for " + request.getJobTitle() + " has been rejected."
        );

        return saved;
    
    }
    public List<RecruitmentRequest> getRequestsByDepartment(Long departmentId) {
        return recruitmentRequestRepo.findByDepartment_Id(departmentId);
    }

    public List<RecruitmentRequest> getPendingRequests() {
        return recruitmentRequestRepo.findByStatus(Status.PENDING);
    }

    public List<RecruitmentRequest> getAllRequests() {
        return recruitmentRequestRepo.findAll();
    }

    
    }
