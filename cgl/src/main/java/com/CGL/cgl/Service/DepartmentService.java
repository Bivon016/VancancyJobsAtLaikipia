package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.DepartmentRequest;
import com.CGL.cgl.Exception.ConflictException;
import com.CGL.cgl.Exception.ForbiddenException;
import com.CGL.cgl.Exception.ResourceNotFoundException;
import com.CGL.cgl.Model.Departments;
import com.CGL.cgl.Model.Role;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.DepartmentRepo;
import com.CGL.cgl.Repo.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {

    private final DepartmentRepo departmentRepo;
    private final UserRepo userRepo;
    public DepartmentService(DepartmentRepo departmentRepo, UserRepo userRepo) {
        this.departmentRepo = departmentRepo;
        this.userRepo = userRepo;
    }

    public Departments createDepartment(DepartmentRequest request){
        Users head = userRepo.findById(request.getDepartmentHead())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if(head.getRole() != Role.DEPT_HEAD){
            throw new ForbiddenException("User is not a department Head");
        }
        if (departmentRepo.existsByDepartmentHead(head)) {
            throw new ConflictException("User is already heading another department");
        }
        Departments department = Departments.builder()
                .departmentName(request.getDepartmentName())
                .description(request.getDescription())
                .departmentHead(head)
                .build();
        return departmentRepo.save(department);
    }

    public Departments updateDepartment(DepartmentRequest request, Long id){

        Departments exists = departmentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("department not found"));
        if (request.getDepartmentName() != null) {
            exists.setDepartmentName(request.getDepartmentName());
        }
        if (request.getDescription() != null) {
            exists.setDescription(request.getDescription());
        }
        
        if (request.getDepartmentHead() != null) {
            Users head = userRepo.findById(request.getDepartmentHead())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (head.getRole() != Role.DEPT_HEAD) {
                throw new ForbiddenException("User is not a department Head");
            }

            if (departmentRepo.existsByDepartmentHeadAndIdNot(head, id)) {
                throw new ConflictException("User is already heading another department");
            }

            exists.setDepartmentHead(head);
        }
        return departmentRepo.save(exists);
    }

    public List<Departments> findAllDepartments(){
        return departmentRepo.findAll();
    }
    public Optional<Departments> findDepartmentById(Long id){
        return departmentRepo.findById(id);
    }

    public Optional<Departments> findDepartmentByName(String name){
        return departmentRepo.findBydepartmentName(name);
    }

    public void deleteDepartmentById(Long id){
       departmentRepo.deleteById(id);
    }
}
