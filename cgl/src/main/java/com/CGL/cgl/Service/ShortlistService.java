package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.ShortlistRequest;
import com.CGL.cgl.Model.Shortlist;

import java.util.List;

public interface ShortlistService {


    Shortlist shortlistApplicant(
            ShortlistRequest request,
            String email
    );


    List<Shortlist> getShortlistByVacancy(
            Long vacancyId
    );

}