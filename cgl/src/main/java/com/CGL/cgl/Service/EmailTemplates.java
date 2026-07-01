package com.CGL.cgl.Service;

/**
 * Static HTML email templates for the CGL Recruitment System.
 * Each method returns a complete HTML string ready to pass to EmailServiceImpl.
 */
public class EmailTemplates {

    private static String header() {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Laikipia County Public Service Board</title>
            </head>
            <body style="margin:0;padding:0;background:#F8F9FA;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;padding:32px 16px;">
                <tr><td align="center">
                  <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

                    <!-- Kenya stripe -->
                    <tr><td style="height:4px;background:linear-gradient(to right,#000 33%,#BB0000 33%,#BB0000 66%,#006600 66%);border-radius:8px 8px 0 0;"></td></tr>

                    <!-- Header -->
                    <tr>
                      <td style="background:#1B4332;padding:20px 32px;border-radius:0;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:40px;height:40px;background:#D4A017;border-radius:8px;text-align:center;vertical-align:middle;">
                              <span style="font-size:18px;font-weight:bold;color:#081C15;line-height:40px;">L</span>
                            </td>
                            <td style="padding-left:12px;">
                              <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff;">Laikipia County</p>
                              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.65);">Public Service Board</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Body card -->
                    <tr>
                      <td style="background:#ffffff;padding:32px;border-left:1px solid #E9ECEF;border-right:1px solid #E9ECEF;">
            """;
    }
    private static String footer() {
        int year = java.time.Year.now().getValue();

        return """
                </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#ffffff;padding:16px 32px 24px;border:1px solid #E9ECEF;border-top:1px solid #E9ECEF;border-radius:0 0 8px 8px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#6C757D;">
                      County Headquarters, Nanyuki &nbsp;&middot;&nbsp; cpsb@laikipia.go.ke &nbsp;&middot;&nbsp; +254 700 000 000
                    </p>
                    <p style="margin:0;font-size:11px;color:#ADB5BD;">
                      &copy; %d County Government of Laikipia. This is an automated message &mdash; please do not reply directly to this email.
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """.formatted(year);
    }

    private static String row(String label, String value) {
        return "<tr>"
            + "<td style=\"padding:5px 0;font-size:13px;color:#6C757D;\">" + label + "</td>"
            + "<td style=\"padding:5px 0;font-size:13px;color:#212529;font-weight:600;text-align:right;\">" + value + "</td>"
            + "</tr>";
    }

    private static String badge(String label, String bg, String color) {
        return "<span style=\"background:" + bg + ";color:" + color + ";font-size:11px;"
            + "font-weight:600;padding:3px 10px;border-radius:999px;\">" + label + "</span>";
    }

    private static String button(String label, String url) {
        return "<a href=\"" + url + "\" style=\"display:inline-block;background:#1B4332;color:#ffffff;"
            + "text-decoration:none;font-size:14px;font-weight:600;padding:10px 24px;"
            + "border-radius:6px;margin-top:24px;\">" + label + " &rarr;</a>";
    }

    private static String infoBox(String label, String... rows) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div style=\"background:#F8F9FA;border-left:3px solid #1B4332;border-radius:4px;padding:14px 16px;margin:20px 0;\">")
          .append("<p style=\"margin:0 0 10px;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#6C757D;\">")
          .append(label).append("</p>")
          .append("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">");
        for (String r : rows) {
            sb.append(r);
        }
        sb.append("</table></div>");
        return sb.toString();
    }

    public static String emailVerification(String firstName, String code) {
        return header()
            + "<p style=\"margin:0 0 4px;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#6C757D;\">Account verification</p>"
            + "<h1 style=\"margin:0 0 20px;font-size:22px;font-weight:600;color:#212529;\">Verify your email address</h1>"
            + "<p style=\"margin:0 0 16px;font-size:15px;color:#495057;line-height:1.7;\">Dear <strong style=\"color:#212529;\">" + firstName + "</strong>,</p>"
            + "<p style=\"margin:0 0 20px;font-size:15px;color:#495057;line-height:1.7;\">Thank you for registering with the Laikipia County Jobs Portal. Use the verification code below to activate your account.</p>"
            + "<div style=\"text-align:center;margin:28px 0;\">"
            +   "<div style=\"display:inline-block;background:#F8F9FA;border:1px solid #DEE2E6;border-radius:8px;padding:20px 40px;\">"
            +     "<p style=\"margin:0 0 4px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6C757D;\">Your verification code</p>"
            +     "<p style=\"margin:0;font-size:36px;font-weight:700;letter-spacing:.2em;color:#1B4332;font-family:monospace;\">" + code + "</p>"
            +   "</div>"
            + "</div>"
            + "<p style=\"margin:0 0 8px;font-size:14px;color:#6C757D;\">This code expires in <strong>15 minutes</strong>. If you did not create this account, you can safely ignore this email.</p>"
            + footer();
    }

    public static String applicationReceived(String firstName, String vacancyTitle,
                                              String departmentName, String referenceNo) {
        return header()
            + "<p style=\"margin:0 0 4px;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#6C757D;\">Application received</p>"
            + "<h1 style=\"margin:0 0 20px;font-size:22px;font-weight:600;color:#212529;\">Your application has been submitted</h1>"
            + "<p style=\"margin:0 0 16px;font-size:15px;color:#495057;line-height:1.7;\">Dear <strong style=\"color:#212529;\">" + firstName + "</strong>,</p>"
            + "<p style=\"margin:0 0 20px;font-size:15px;color:#495057;line-height:1.7;\">We have successfully received your application. Our team will review it and you will be notified of any updates through this email and your portal account.</p>"
            + infoBox("Application details",
                row("Reference No.", referenceNo),
                row("Position", vacancyTitle),
                row("Department", departmentName),
                "<tr><td style=\"padding:5px 0;font-size:13px;color:#6C757D;\">Status</td>"
                + "<td style=\"padding:5px 0;text-align:right;\">" + badge("Submitted", "#E9ECEF", "#495057") + "</td></tr>"
              )
            + "<p style=\"margin:0;font-size:14px;color:#6C757D;\">Log in to your portal account to track the status of your application at any time.</p>"
            + button("View application", "https://jobs.laikipia.go.ke")
            + footer();
    }

    public static String shortlisted(String firstName, String vacancyTitle,
                                      String departmentName, String referenceNo,
                                      String remarks) {
        String remarksBlock = (remarks != null && !remarks.isBlank())
            ? "<p style=\"margin:20px 0 0;font-size:14px;color:#495057;line-height:1.7;\"><strong>Remarks from the board:</strong> " + remarks + "</p>"
            : "";

        return header()
            + "<p style=\"margin:0 0 4px;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#6C757D;\">Application update</p>"
            + "<h1 style=\"margin:0 0 20px;font-size:22px;font-weight:600;color:#212529;\">You have been shortlisted</h1>"
            + "<p style=\"margin:0 0 16px;font-size:15px;color:#495057;line-height:1.7;\">Dear <strong style=\"color:#212529;\">" + firstName + "</strong>,</p>"
            + "<p style=\"margin:0 0 20px;font-size:15px;color:#495057;line-height:1.7;\">Congratulations! Your application has been reviewed and you have been shortlisted for the next stage of the recruitment process.</p>"
            + infoBox("Application details",
                row("Reference No.", referenceNo),
                row("Position", vacancyTitle),
                row("Department", departmentName),
                "<tr><td style=\"padding:5px 0;font-size:13px;color:#6C757D;\">Status</td>"
                + "<td style=\"padding:5px 0;text-align:right;\">" + badge("Shortlisted", "#D3E4FF", "#0C3B8C") + "</td></tr>"
              )
            + "<p style=\"margin:0;font-size:15px;color:#495057;line-height:1.7;\">Further communication regarding interview scheduling will be shared with you shortly. Please ensure your contact details on the portal are up to date.</p>"
            + remarksBlock
            + button("View application", "https://jobs.laikipia.go.ke")
            + footer();
    }

    public static String interviewScheduled(String firstName, String vacancyTitle,
                                             String departmentName, String referenceNo,
                                             String interviewDate, String interviewTime,
                                             String venue, String examLink) {
        return header()
            + "<p style=\"margin:0 0 4px;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#6C757D;\">Interview invitation</p>"
            + "<h1 style=\"margin:0 0 20px;font-size:22px;font-weight:600;color:#212529;\">Your interview has been scheduled</h1>"
            + "<p style=\"margin:0 0 16px;font-size:15px;color:#495057;line-height:1.7;\">Dear <strong style=\"color:#212529;\">" + firstName + "</strong>,</p>"
            + "<p style=\"margin:0 0 20px;font-size:15px;color:#495057;line-height:1.7;\">We are pleased to invite you for an interview for the position of <strong style=\"color:#212529;\">" + vacancyTitle + "</strong>. Please find the details below.</p>"
            + infoBox("Interview details",
                row("Position", vacancyTitle),
                row("Department", departmentName),
                row("Reference No.", referenceNo),
                row("Date", interviewDate),
                row("Time", interviewTime),
                row("Venue", venue),
                "<tr><td style=\"padding:5px 0;font-size:13px;color:#6C757D;\">Status</td>"
                + "<td style=\"padding:5px 0;text-align:right;\">" + badge("Interview Scheduled", "#FFF3CD", "#856404") + "</td></tr>"
              )
            + "<p style=\"margin:0;font-size:15px;color:#495057;line-height:1.7;\">Please arrive at least 15 minutes before your scheduled time. Bring a copy of your National ID and any certificates listed in your application.</p>"
            + button("Open exam link", examLink)
            + footer();
    }

    public static String selected(String firstName, String vacancyTitle,
                                   String departmentName, String referenceNo) {
        return header()
            + "<p style=\"margin:0 0 4px;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#6C757D;\">Appointment notice</p>"
            + "<h1 style=\"margin:0 0 20px;font-size:22px;font-weight:600;color:#212529;\">Congratulations &mdash; you have been selected</h1>"
            + "<p style=\"margin:0 0 16px;font-size:15px;color:#495057;line-height:1.7;\">Dear <strong style=\"color:#212529;\">" + firstName + "</strong>,</p>"
            + "<p style=\"margin:0 0 20px;font-size:15px;color:#495057;line-height:1.7;\">After a thorough review of all candidates, we are delighted to inform you that you have been selected for the position of <strong style=\"color:#212529;\">" + vacancyTitle + "</strong>. The board will be in touch shortly with your formal appointment letter and onboarding details.</p>"
            + infoBox("Appointment details",
                row("Reference No.", referenceNo),
                row("Position", vacancyTitle),
                row("Department", departmentName),
                "<tr><td style=\"padding:5px 0;font-size:13px;color:#6C757D;\">Status</td>"
                + "<td style=\"padding:5px 0;text-align:right;\">" + badge("Selected", "#D1FAE5", "#065F46") + "</td></tr>"
              )
            + "<p style=\"margin:0;font-size:15px;color:#495057;line-height:1.7;\">Please log in to your portal account and confirm your acceptance within 5 working days.</p>"
            + button("Confirm acceptance", "https://jobs.laikipia.go.ke")
            + footer();
    }

    public static String rejected(String firstName, String vacancyTitle,
                                   String departmentName, String referenceNo) {
        return header()
            + "<p style=\"margin:0 0 4px;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#6C757D;\">Application outcome</p>"
            + "<h1 style=\"margin:0 0 20px;font-size:22px;font-weight:600;color:#212529;\">Application outcome</h1>"
            + "<p style=\"margin:0 0 16px;font-size:15px;color:#495057;line-height:1.7;\">Dear <strong style=\"color:#212529;\">" + firstName + "</strong>,</p>"
            + "<p style=\"margin:0 0 20px;font-size:15px;color:#495057;line-height:1.7;\">Thank you for your interest in the position of <strong style=\"color:#212529;\">" + vacancyTitle + "</strong> and for the time you invested in your application. After careful consideration, we regret to inform you that you have not been successful in this round of recruitment.</p>"
            + infoBox("Application details",
                row("Reference No.", referenceNo),
                row("Position", vacancyTitle),
                row("Department", departmentName),
                "<tr><td style=\"padding:5px 0;font-size:13px;color:#6C757D;\">Status</td>"
                + "<td style=\"padding:5px 0;text-align:right;\">" + badge("Unsuccessful", "#F8D7DA", "#842029") + "</td></tr>"
              )
            + "<p style=\"margin:0;font-size:15px;color:#495057;line-height:1.7;\">We encourage you to continue checking the portal for future vacancies that match your qualifications and experience. We wish you the best in your career.</p>"
            + button("Browse open vacancies", "https://jobs.laikipia.go.ke/vacancies")
            + footer();
    }

    public static String assessmentInvited(String firstName, String vacancyTitle,
                                            String departmentName, String assessmentLink) {
        return header()
            + "<p style=\"margin:0 0 4px;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#6C757D;\">Pre-screening assessment</p>"
            + "<h1 style=\"margin:0 0 20px;font-size:22px;font-weight:600;color:#212529;\">Complete your pre-screening assessment</h1>"
            + "<p style=\"margin:0 0 16px;font-size:15px;color:#495057;line-height:1.7;\">Dear <strong style=\"color:#212529;\">" + firstName + "</strong>,</p>"
            + "<p style=\"margin:0 0 20px;font-size:15px;color:#495057;line-height:1.7;\">Congratulations on being shortlisted for <strong style=\"color:#212529;\">" + vacancyTitle + "</strong>. As part of the next stage, we invite you to complete a short pre-screening assessment.</p>"
            + infoBox("Assessment details",
                row("Position", vacancyTitle),
                row("Department", departmentName),
                "<tr><td style=\"padding:5px 0;font-size:13px;color:#6C757D;\">Status</td>"
                + "<td style=\"padding:5px 0;text-align:right;\">" + badge("Assessment Required", "#FFF3CD", "#856404") + "</td></tr>"
              )
            + "<p style=\"margin:0;font-size:15px;color:#495057;line-height:1.7;\">Please complete the assessment at your earliest convenience. The assessment consists of a few questions to help us better understand your qualifications for this role.</p>"
            + button("Start assessment", assessmentLink)
            + footer();
    }
}
