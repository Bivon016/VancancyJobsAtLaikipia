package com.CGL.cgl.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendEmail(String to, String subject, String body) {

        System.out.println("MAIL_FROM = " + fromEmail);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);

            System.out.println("Email sent successfully.");
            System.out.println("Recipient: " + to);

        } catch (MailException e) {

            System.out.println("Failed to send email.");
            e.printStackTrace();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlBody) {

        System.out.println("MAIL_FROM = " + fromEmail);

        try {

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);

            System.out.println("HTML email sent successfully.");
            System.out.println("Recipient: " + to);

        } catch (MessagingException e) {

            System.out.println("Failed to create email.");
            e.printStackTrace();

        } catch (MailException e) {

            System.out.println("Failed to send email.");
            e.printStackTrace();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}