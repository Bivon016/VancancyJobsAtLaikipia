package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.ShortlistRequest;
import com.CGL.cgl.DTO.ShortlistResponseDTO;
import java.util.List;

public interface ShortlistService {
    ShortlistResponseDTO shortlistApplicant(
        ShortlistRequest request,
        String email
    );

    List<ShortlistResponseDTO> getShortlistByVacancy(Long vacancyId);
}
