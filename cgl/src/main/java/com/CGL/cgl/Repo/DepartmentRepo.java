package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Departments;
import com.CGL.cgl.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepo extends JpaRepository<Departments, Long> {
    boolean existsByDepartmentHeadAndIdNot(Users departmentHead, Long id);
    boolean existsByDepartmentHead(Users head);
    Optional<Departments> findBydepartmentName(String name);
}
