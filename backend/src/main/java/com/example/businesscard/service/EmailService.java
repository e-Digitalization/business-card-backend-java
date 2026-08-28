package com.example.businesscard.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final boolean enabled;
    private final String from;

    public EmailService(ObjectProvider<JavaMailSender> mailSender,
                        @Value("${app.mail.enabled:false}") boolean enabled,
                        @Value("${app.mail.from:Kadi Moja <no-reply@kadimoja.com>}") String from) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.from = from;
    }

    public boolean isEnabled() {
        return enabled && mailSender.getIfAvailable() != null;
    }

    /**
     * Sends the account-verification code. Returns true when the message was
     * handed to the SMTP server; false when email is not configured (the caller
     * then falls back to logging / surfacing the code for testing).
     */
    public boolean sendVerificationCode(String to, String code, int ttlMinutes) {
        String subject = "Your Kadi Moja verification code";
        String body = "Karibu Kadi Moja!\n\n"
            + "Your verification code is: " + code + "\n\n"
            + "Enter it on the sign-up screen to finish creating your account. "
            + "The code expires in " + ttlMinutes + " minutes.\n\n"
            + "If you didn't request this, you can ignore this email.";
        return send(to, subject, body);
    }

    private boolean send(String to, String subject, String body) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (!enabled || sender == null) {
            log.warn("Email disabled (app.mail.enabled={}, sender={}). Would have sent \"{}\" to {}.",
                enabled, sender != null, subject, to);
            return false;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            sender.send(message);
            log.info("Sent \"{}\" to {}.", subject, to);
            return true;
        } catch (Exception ex) {
            log.error("Failed to send \"{}\" to {}: {}", subject, to, ex.getMessage());
            return false;
        }
    }
}
