package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.domain.task.ProgrammingTask;
import org.example.domain.user.User;
import org.example.dto.task.TaskRequest;
import org.example.dto.task.TaskResponse;
import org.example.repository.userRepository.UserRepository;
import org.example.service.programmingTaskService.ProgrammingTaskService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProgrammingTaskController {

    private final ProgrammingTaskService programmingTaskService;
    private final UserRepository userRepository;

    @GetMapping("/lessons/{lessonId}/tasks")
    public List<TaskResponse> getTasksByLesson(
            @PathVariable Long lessonId) {

        return programmingTaskService.getTasksByLesson(lessonId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/tasks/{taskId}")
    public TaskResponse getTask(@PathVariable Long taskId) {
        return toResponse(programmingTaskService.getTaskById(taskId));
    }

    @PostMapping("/lessons/{lessonId}/tasks")
    public TaskResponse createTask(
            @PathVariable Long lessonId,
            @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User author = getCurrentUser(userDetails);

        ProgrammingTask task = new ProgrammingTask();
        copyRequest(request, task);

        ProgrammingTask created = programmingTaskService.createTask(
                lessonId, author.getId(), task
        );

        return toResponse(created);
    }

    @PutMapping("/tasks/{taskId}")
    public TaskResponse updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User author = getCurrentUser(userDetails);

        ProgrammingTask updated = new ProgrammingTask();
        copyRequest(request, updated);

        return toResponse(programmingTaskService.updateTask(
                taskId, author.getId(), updated
        ));
    }

    @DeleteMapping("/tasks/{taskId}")
    public void deleteTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User author = getCurrentUser(userDetails);
        programmingTaskService.deleteTask(taskId, author.getId());
    }

    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() ->
                        new RuntimeException("Пользователь не найден"));
    }

    private void copyRequest(TaskRequest request, ProgrammingTask task) {
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setInputDescription(request.inputDescription());
        task.setOutputDescription(request.outputDescription());
        task.setExamples(request.examples());
        task.setProgrammingLanguage(request.programmingLanguage());
        task.setStarterCode(request.starterCode());
    }

    private TaskResponse toResponse(ProgrammingTask task) {
        return new TaskResponse(
                task.getId(),
                task.getLesson().getId(),
                task.getTitle(),
                task.getDescription(),
                task.getInputDescription(),
                task.getOutputDescription(),
                task.getExamples(),
                task.getProgrammingLanguage(),
                task.getStarterCode()
        );
    }
}
