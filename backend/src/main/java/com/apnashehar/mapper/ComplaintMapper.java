package com.apnashehar.mapper;

import com.apnashehar.dto.request.ComplaintRequest;
import com.apnashehar.dto.response.ComplaintResponse;
import com.apnashehar.entity.Complaint;
import org.mapstruct.*;

import java.util.List;

/**
 * Complaint Entity to DTO Mapper
 */
@Mapper(componentModel = "spring", 
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {UserMapper.class, AttachmentMapper.class})
public interface ComplaintMapper {

    @Mapping(target = "status", constant = "SUBMITTED")
    @Mapping(target = "upvoteCount", constant = "0")
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "assignedTo", ignore = true)
    @Mapping(target = "resolvedBy", ignore = true)
    @Mapping(target = "resolvedAt", ignore = true)
    @Mapping(target = "adminRemarks", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "votes", ignore = true)
    Complaint toEntity(ComplaintRequest request);

    @Mapping(target = "commentCount", ignore = true)
    @Mapping(target = "hasUserVoted", ignore = true)
    @Mapping(target = "hasUserUpvoted", ignore = true)
    ComplaintResponse toResponse(Complaint complaint);

    List<ComplaintResponse> toResponseList(List<Complaint> complaints);

    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "votes", ignore = true)
    @Mapping(target = "upvoteCount", ignore = true)
    void updateEntityFromRequest(ComplaintRequest request, @MappingTarget Complaint complaint);
}