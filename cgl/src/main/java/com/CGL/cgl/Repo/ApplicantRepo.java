package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Applicant;
import com.CGL.cgl.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicantRepo extends JpaRepository<Applicant,Long> {
    Optional<Applicant> findByUser(Users user);
    Optional<Applicant> findByNationalId(String nationalId);

}
