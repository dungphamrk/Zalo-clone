package com.example.zalocloneserver.repository;


import com.example.zalocloneserver.model.entity.Post;
import com.example.zalocloneserver.model.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IPostMediaRepository extends JpaRepository<PostMedia, Long>{

    List<PostMedia> findByPost(Post post);
}
