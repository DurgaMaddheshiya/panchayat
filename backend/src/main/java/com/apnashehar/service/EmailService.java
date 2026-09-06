package com.apnashehar.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from:noreply@apnashehar.com}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Apna Shehar - Email Verification OTP");
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Welcome to Apna Shehar! Please verify your email address using the OTP below:\n\n" +
                "OTP: %s\n\n" +
                "This OTP is valid for 10 minutes only.\n\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Apna Shehar Team",
                fullName != null ? fullName : "User", 
                otp
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.info("OTP email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send verification email");
        }
    }

    public void sendWelcomeEmail(String toEmail, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to Apna Shehar!");
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Welcome to Apna Shehar! Your email has been verified successfully.\n\n" +
                "You can now:\n" +
                "• File complaints about civic issues\n" +
                "• Track complaint status\n" +
                "• Engage with your community\n\n" +
                "Together, let's make our city better!\n\n" +
                "Best regards,\n" +
                "Apna Shehar Team",
                fullName != null ? fullName : "User"
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.info("Welcome email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
            // Don't throw exception for welcome email failure
        }
    }
}