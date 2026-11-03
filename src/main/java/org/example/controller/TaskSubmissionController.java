package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.domain.task.TaskSubmission;
import org.example.domain.user.User;
import org.example.dto.task.ReviewSubmissionRequest;
import org.example.dto.task.SubmissionRequest;
import org.example.dto.task.SubmissionResponse;
import org.example.repository.userRepository.UserRepository;
import org.example.service.taskSubmissionService.TaskSubmissionService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskSubmissionController {

    private final TaskSubmissionService submissionService;
    private final UserRepository userRepository;

    @PostMapping("/tasks/{taskId}/submissions")
    @ResponseStatus(HttpStatus.CREATED)
    public SubmissionResponse submitSolution(
            @PathVariable Long taskId,
            @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        User student = getCurrentUser(principal);

        TaskSubmission submission =
                submissionService.submitSolution(
                        taskId,
                        student.getId(),
                        request.submittedCode()
                );

        return toResponse(submission);
    }

    @GetMapping("/submissions/my")
    public List<SubmissionResponse> getMySubmissions(
            @AuthenticationPrincipal UserDetails principal
    ) {
        User student = getCurrentUser(principal);

        return submissionService
                .getStudentSubmissions(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/tasks/{taskId}/submissions/my")
    public List<SubmissionResponse> getMyTaskSubmissions(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        User student = getCurrentUser(principal);

        return submissionService
                .getSubmissionsByTask(taskId, student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/submissions/pending")
    public List<SubmissionResponse> getPendingSubmissions(
            @AuthenticationPrincipal UserDetails principal
    ) {
        User author = getCurrentUser(principal);

        return submissionService
                .getPendingSubmissions(author.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PutMapping("/submissions/{submissionId}/review")
    public SubmissionResponse reviewSubmission(
            @PathVariable Long submissionId,
            @RequestBody ReviewSubmissionRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        User author = getCurrentUser(principal);

        TaskSubmission submission =
                submissionService.reviewSubmission(
                        submissionId,
                        author.getId(),
                        request.status(),
                        request.grade(),
                        request.teacherComment()
                );

        return toResponse(submission);
    }

    private User getCurrentUser(UserDetails principal) {
        if (principal == null) {
            throw new IllegalStateException(
                    "Пользователь не авторизован"
            );
        }

        return userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Пользователь не найден"
                        )
                );
    }

    private SubmissionResponse toResponse(TaskSubmission submission) {
        return new SubmissionResponse(
                submission.getId(),
                submission.getTask().getId(),
                submission.getTask().getTitle(),

                submission.getTask().getLesson().getId(),
                submission.getTask().getLesson().getTitle(),

                submission.getTask().getLesson().getCourse().getId(),
                submission.getTask().getLesson().getCourse().getTitle(),

                submission.getStudent().getUsername(),
                submission.getSubmittedCode(),
                submission.getStatus(),
                submission.getGrade(),
                submission.getTeacherComment(),

                submission.getReviewer() == null
                        ? null
                        : submission.getReviewer().getUsername(),

                submission.getSubmittedAt(),
                submission.getReviewedAt()
        );
    }
}
