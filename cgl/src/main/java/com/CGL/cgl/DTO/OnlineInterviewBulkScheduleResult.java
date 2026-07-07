package com.CGL.cgl.DTO;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Result of scheduling online interviews for every shortlisted applicant of a
 * vacancy. The bulk endpoint silently skips applicants who aren't SHORTLISTED
 * or who already have an interview — this DTO makes those skips visible to
 * the caller instead of returning a bare list that looks identical whether
 * 5 interviews were created or 0 were.
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OnlineInterviewBulkScheduleResult {
    private List<OnlineInterviewResponse> created;
    private int totalShortlisted;
    private int alreadyScheduledCount;
    private int createdCount;
}
