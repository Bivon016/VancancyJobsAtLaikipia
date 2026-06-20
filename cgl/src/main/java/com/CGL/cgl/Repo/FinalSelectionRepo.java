package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Applications;
import com.CGL.cgl.Model.FinalSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface FinalSelectionRepo
        extends JpaRepository<FinalSelection, Long> {


    Optional<FinalSelection> findByApplication(
            Applications application
    );


    List<FinalSelection> findByApplication_Vacancy_Id(
            Long vacancyId
    );

}