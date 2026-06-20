package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Applications;
import com.CGL.cgl.Model.Shortlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ShortlistRepo extends JpaRepository<Shortlist, Long> {


    Optional<Shortlist> findByApplication(Applications application);


    List<Shortlist> findByApplication_Vacancy_Id(Long vacancyId);


}