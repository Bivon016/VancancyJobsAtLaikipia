package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.InterviewQuestionRequest;
import com.CGL.cgl.DTO.InterviewQuestionResponse;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InterviewQuestionServiceImplTest {

    @Mock
    private InterviewQuestionRepo interviewQuestionRepo;

    @Mock
    private InterviewAnswerRepo interviewAnswerRepo;

    @Mock
    private InterviewRepo interviewRepo;

    @Mock
    private InterviewPanelRepo interviewPanelRepo;

    @Mock
    private UserRepo usersRepo;

    @Mock
    private JobVacancyRepo jobVacancyRepo;

    @InjectMocks
    private InterviewQuestionServiceImpl interviewQuestionService;

    @Test
    void postQuestionShouldAttachVacancyAndInterview() {
        Users panelUser = Users.builder()
                .email("panel@example.com")
                .role(Role.PANEL_MEMBER)
                .fName("Panel")
                .lName("Member")
                .build();

        JobVacancy vacancy = JobVacancy.builder()
                .id(7L)
                .title("Revenue Officer")
                .build();

        Applications application = Applications.builder()
                .vacancy(vacancy)
                .build();

        Interview interview = Interview.builder()
                .id(12L)
                .application(application)
                .build();

        InterviewQuestionRequest request = new InterviewQuestionRequest();
        request.setInterviewId(12L);
        request.setQuestionText("Describe your experience");
        request.setModelAnswer("A good answer");
        request.setMarkingRubric("Look for clarity");
        request.setMaxScore(20);

        when(usersRepo.findByEmail("panel@example.com")).thenReturn(Optional.of(panelUser));
        when(interviewRepo.findById(12L)).thenReturn(Optional.of(interview));
        when(interviewPanelRepo.existsByInterviewAndPanelMember(interview, panelUser)).thenReturn(true);
        when(interviewQuestionRepo.save(any(InterviewQuestion.class))).thenAnswer(invocation -> {
            InterviewQuestion saved = invocation.getArgument(0);
            saved.setId(99L);
            saved.setCreatedAt(LocalDateTime.now());
            return saved;
        });

        InterviewQuestionResponse response = interviewQuestionService.postQuestion(request, "panel@example.com");

        ArgumentCaptor<InterviewQuestion> captor = ArgumentCaptor.forClass(InterviewQuestion.class);
        verify(interviewQuestionRepo).save(captor.capture());

        InterviewQuestion saved = captor.getValue();
        assertThat(saved.getVacancy()).isEqualTo(vacancy);
        assertThat(saved.getInterview()).isEqualTo(interview);
        assertThat(response.getQuestionText()).isEqualTo("Describe your experience");
    }
}
