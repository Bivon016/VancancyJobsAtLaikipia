package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.ShortlistRequest;
import com.CGL.cgl.Model.Shortlist;
import com.CGL.cgl.Service.ShortlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shortlist")
public class ShortlistController {

    private final ShortlistService shortlistService;

    public ShortlistController(
            ShortlistService shortlistService
    ) {
        this.shortlistService = shortlistService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR_OFFICER','CPSB_ADMIN')")
    public ResponseEntity<Shortlist> shortlistApplicant(
            @RequestBody ShortlistRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                shortlistService.shortlistApplicant(
                        request,
                        email
                )
        );
    }

    @GetMapping("/vacancy/{vacancyId}")
    @PreAuthorize("hasAnyRole('HR_OFFICER','CPSB_ADMIN')")
    public ResponseEntity<List<Shortlist>> getShortlistByVacancy(
            @PathVariable Long vacancyId
    ) {

        return ResponseEntity.ok(
                shortlistService.getShortlistByVacancy(vacancyId)
        );
    }
}