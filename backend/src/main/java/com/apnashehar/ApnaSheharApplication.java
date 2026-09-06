package com.apnashehar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Apna Shehar - Smart Grievance Management System
 * Main application entry point
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableJpaAuditing
public class ApnaSheharApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApnaSheharApplication.class, args);
    }
}
