package com.CGL.cgl.Repo;

import com.CGL.cgl.DTO.CandidateScoreSummary;
import com.CGL.cgl.Model.Interview;
import com.CGL.cgl.Model.InterviewScore;
import com.CGL.cgl.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewScoreRepo
        extends JpaRepository<InterviewScore, Long> {

    Optional<InterviewScore> findByInterviewAndPanelMember(
            Interview interview,
            Users panelMember
    );
    void deleteByPanelMember(Users panelMember);

    List<InterviewScore> findByInterview(
            Interview interview
    );

    @Query("""
SELECT new com.CGL.cgl.DTO.CandidateScoreSummary(
    a.id,
    i.id,
    CONCAT(au.fName, ' ', au.lName),
    au.email,
    i.status,
    COUNT(s.id),
    AVG(s.technicalScore),
    AVG(s.communicationScore),
    AVG(s.experienceScore),
    AVG(s.totalScore)
)
FROM InterviewScore s
JOIN s.interview i
JOIN i.application a
JOIN a.applicant ap
JOIN ap.user au
WHERE a.vacancy.id = :vacancyId
GROUP BY
    a.id,
    i.id,
    au.fName,
    au.lName,
    au.email,
    i.status
ORDER BY AVG(s.totalScore) DESC
""")
    List<CandidateScoreSummary> findScoreSummaryByVacancy(@Param("vacancyId") Long vacancyId);
}