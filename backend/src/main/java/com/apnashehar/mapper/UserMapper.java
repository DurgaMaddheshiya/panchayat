package com.apnashehar.mapper;

import com.apnashehar.dto.request.UserRegistrationRequest;
import com.apnashehar.dto.response.UserResponse;
import com.apnashehar.entity.User;
import org.mapstruct.*;

import java.util.List;

/**
 * User Entity to DTO Mapper
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "isVerified", constant = "false")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "complaints", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "votes", ignore = true)
    @Mapping(target = "notifications", ignore = true)
    @Mapping(target = "verificationToken", ignore = true)
    @Mapping(target = "resetToken", ignore = true)
    User toEntity(UserRegistrationRequest request);

    UserResponse toResponse(User user);

    List<UserResponse> toResponseList(List<User> users);

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "complaints", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "votes", ignore = true)
    @Mapping(target = "notifications", ignore = true)
    @Mapping(target = "verificationToken", ignore = true)
    @Mapping(target = "resetToken", ignore = true)
    void updateEntityFromRequest(UserRegistrationRequest request, @MappingTarget User user);
}