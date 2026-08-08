package com.apnashehar.util;

import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.Random;

/**
 * Utility class to generate unique complaint IDs
 * Format: ASH-YYYY-XXXXXX (e.g., ASH-2024-123456)
 */
@Component
public class ComplaintIdGenerator {

    private static final String PREFIX = "ASH";
    private static final Random random = new Random();

    public String generateComplaintId() {
        int year = Year.now().getValue();
        int randomNumber = 100000 + random.nextInt(900000);
        return String.format("%s-%d-%d", PREFIX, year, randomNumber);
    }
}
