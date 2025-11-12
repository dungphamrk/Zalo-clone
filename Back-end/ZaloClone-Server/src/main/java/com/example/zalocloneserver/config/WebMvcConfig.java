package com.example.zalocloneserver.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer
            .defaultContentType(MediaType.APPLICATION_JSON)
            .mediaType("json", MediaType.APPLICATION_JSON)
            .mediaType("xml", MediaType.APPLICATION_XML);
    }

    @Bean
    public FilterRegistrationBean<ContentTypeFilter> contentTypeFilter() {
        FilterRegistrationBean<ContentTypeFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new ContentTypeFilter());
        registration.addUrlPatterns("/api/v1/posts");
        registration.setName("contentTypeFilter");
        registration.setOrder(1);
        return registration;
    }

    public static class ContentTypeFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
                throws ServletException, IOException {
            if (request.getContentType() != null && 
                request.getContentType().contains("multipart/form-data") && 
                request.getContentType().contains("charset")) {
                
                // Loại bỏ charset từ Content-Type header
                String contentType = request.getContentType().replaceAll(";\\s*charset=[^;]*", "");
                
                HttpServletRequestWrapper wrappedRequest = new HttpServletRequestWrapper(request) {
                    @Override
                    public String getContentType() {
                        return contentType;
                    }
                    
                    @Override
                    public String getHeader(String name) {
                        if ("Content-Type".equalsIgnoreCase(name)) {
                            return contentType;
                        }
                        return super.getHeader(name);
                    }
                    
                    @Override
                    public Enumeration<String> getHeaders(String name) {
                        if ("Content-Type".equalsIgnoreCase(name)) {
                            return Collections.enumeration(List.of(contentType));
                        }
                        return super.getHeaders(name);
                    }
                };
                
                filterChain.doFilter(wrappedRequest, response);
            } else {
                filterChain.doFilter(request, response);
            }
        }
    }
}

