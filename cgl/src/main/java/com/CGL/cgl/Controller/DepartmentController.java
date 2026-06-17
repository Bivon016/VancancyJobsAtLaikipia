package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.DepartmentRequest;
import com.CGL.cgl.Model.Departments;
import com.CGL.cgl.Service.DepartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/departments")
public class DepartmentController {

    private final DepartmentService departmentService;
    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Departments> createDepartment(@RequestBody DepartmentRequest request) {
       return ResponseEntity.ok(departmentService.createDepartment(request));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Departments> updateDepartment(@RequestBody DepartmentRequest request,@PathVariable Long id) {
                return ResponseEntity.ok(departmentService.updateDepartment(request,id));
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartmentById(id);
        return ResponseEntity.ok("Department deleted successfully");
    }
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Departments> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.findDepartmentById(id)
                .orElseThrow(() -> new RuntimeException("Department not found")));
    }

    @GetMapping("/allDepartments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Departments>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.findAllDepartments());
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Departments> findDepartmentByDepartmentName(@RequestParam String name) {
        return ResponseEntity.ok(departmentService.findDepartmentByName(name)
                .orElseThrow(() -> new RuntimeException("Department not found")));
    }
}
