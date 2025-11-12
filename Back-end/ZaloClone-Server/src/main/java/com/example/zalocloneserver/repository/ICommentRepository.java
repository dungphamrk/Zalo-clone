package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.entity.Comment;
import com.example.zalocloneserver.model.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ICommentRepository extends JpaRepository<Comment, Long>{
    List<Comment> findByPost(Post post);
}
