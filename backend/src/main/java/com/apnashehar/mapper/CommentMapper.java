package com.apnashehar.mapper;

import com.apnashehar.dto.request.CommentRequest;
import com.apnashehar.dto.response.CommentResponse;
import com.apnashehar.entity.Comment;
import org.mapstruct.*;

import java.util.List;

/**
 * Comment Entity to DTO Mapper
 */
@Mapper(componentModel = "spring", 
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {UserMapper.class})
public interface CommentMapper {

    @Mapping(target = "complaint", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "parentComment", ignore = true)
    @Mapping(target = "replies", ignore = true)
    Comment toEntity(CommentRequest request);

    CommentResponse toResponse(Comment comment);

    List<CommentResponse> toResponseList(List<Comment> comments);
}