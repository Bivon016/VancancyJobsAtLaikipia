package com.CGL.cgl.Service;

import com.CGL.cgl.Exception.ConflictException;
import com.CGL.cgl.Exception.ResourceNotFoundException;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    private final UserRepo userRepo;
    private final ApplicantRepo applicantRepo;
    private final ApplicationsRepo applicationsRepo;
    private final NotificationRepo notificationRepo;
    private final ShortlistRepo shortlistRepo;
    private final InterviewPanelRepo interviewPanelRepo;
    private final InterviewScoreRepo interviewScoreRepo;
    private final DepartmentRepo departmentRepo;
    private final FinalSelectionRepo finalSelectionRepo;
    private final EmailVerificationTokenRepo emailVerificationTokenRepo;


    public AdminService(UserRepo userRepo, ApplicantRepo applicantRepo, ApplicationsRepo applicationsRepo, NotificationRepo notificationRepo, ShortlistRepo shortlistRepo, InterviewPanelRepo interviewPanelRepo, InterviewScoreRepo interviewScoreRepo,
            DepartmentRepo departmentRepo, FinalSelectionRepo finalSelectionRepo, EmailVerificationTokenRepo emailVerificationTokenRepo) {
        this.userRepo = userRepo;
        this.applicantRepo = applicantRepo;
        this.applicationsRepo = applicationsRepo;
        this.notificationRepo = notificationRepo;
        this.shortlistRepo = shortlistRepo;
        this.interviewPanelRepo = interviewPanelRepo;
        this.interviewScoreRepo = interviewScoreRepo;
        this.departmentRepo = departmentRepo;
        this.finalSelectionRepo = finalSelectionRepo;
        this.emailVerificationTokenRepo = emailVerificationTokenRepo;
    }

    @Transactional
    public void deleteUser(Long userId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.DEPT_HEAD) {
            throw new ConflictException(
                    "Cannot delete a Department Head directly. Reassign the department first."
            );
        }

        cascadeDeleteUser(user);
    }

    @Transactional
    public void reassignAndDeleteDeptHead(Long userId, Long newHeadId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.DEPT_HEAD) {
            throw new ConflictException("User is not a Department Head");
        }

        Users newHead = userRepo.findById(newHeadId)
                .orElseThrow(() -> new ResourceNotFoundException("New department head not found"));

        if (newHead.getRole() != Role.DEPT_HEAD) {
            throw new ConflictException("Selected user is not a Department Head");
        }

        if (newHead.getId().equals(userId)) {
            throw new ConflictException("New head must be a different user");
        }

        // Check new head is not already heading another department
        if (departmentRepo.existsByDepartmentHead(newHead)) {
            throw new ConflictException(
                    "Selected user is already heading another department"
            );
        }

        // Reassign department to new head
        departmentRepo.findByDepartmentHead(user).ifPresent(dept -> {
            dept.setDepartmentHead(newHead);
            departmentRepo.save(dept);
        });

        cascadeDeleteUser(user);
    }

//    private void cascadeDeleteUser(Users user) {
//        emailVerificationTokenRepo.deleteByUser(user);
//        // 1. Notifications
//        notificationRepo.deleteByUser(user);
//
//        // 2. Interview scores and panel assignments
//        interviewScoreRepo.deleteByPanelMember(user);
//        interviewPanelRepo.deleteByPanelMember(user);
//
//        // 3. Applicant profile + their applications
//        applicantRepo.findByUser(user).ifPresent(applicant -> {
//            List<Applications> apps = applicationsRepo.findByApplicant(applicant);
//            apps.forEach(app -> {
//                // Delete final selection tied to this application
//                finalSelectionRepo.findByApplication(app)
//                        .ifPresent(finalSelectionRepo::delete);
//                // Delete shortlist tied to this application
//                shortlistRepo.findByApplication(app)
//                        .ifPresent(shortlistRepo::delete);
//                applicationsRepo.delete(app);
//            });
//            applicantRepo.delete(applicant);
//        });
//
//        // 4. Delete the user
//        userRepo.delete(user);
//    }
private void cascadeDeleteUser(Users user) {
    emailVerificationTokenRepo.deleteByUser(user);
    notificationRepo.deleteByUser(user);
    interviewScoreRepo.deleteByPanelMember(user);
    interviewPanelRepo.deleteByPanelMember(user);

    // Add this debug block
    Optional<Applicant> applicant = applicantRepo.findByUser(user);
    System.out.println("=== DEBUG: Looking for applicant for user id=" + user.getId() +
            " email=" + user.getEmail());
    System.out.println("=== DEBUG: Applicant found: " + applicant.isPresent());

    applicant.ifPresent(a -> {
        List<Applications> apps = applicationsRepo.findByApplicant(a);
        System.out.println("=== DEBUG: Applications count: " + apps.size());
        apps.forEach(app -> {
            finalSelectionRepo.findByApplication(app)
                    .ifPresent(finalSelectionRepo::delete);
            shortlistRepo.findByApplication(app)
                    .ifPresent(shortlistRepo::delete);
            applicationsRepo.delete(app);
        });
        applicantRepo.delete(a);
    });

    userRepo.delete(user);
}
}