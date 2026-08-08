package com.apnashehar.dto.response;

import com.apnashehar.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JWT Authentication Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponse {

    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private Long id;
    private String fullName;
    private String email;
    private UserRole role;
    private String village;
    private Integer wardNumber;
    private String profileImage;
    private Boolean isVerified;
}