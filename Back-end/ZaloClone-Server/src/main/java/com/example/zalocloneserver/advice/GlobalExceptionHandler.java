package com.example.zalocloneserver.advice;

import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.base.ErrorDetail;
import com.example.zalocloneserver.exception.UnauthorizedException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import org.apache.coyote.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import javax.naming.AuthenticationException;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ==================== HELPER METHOD ====================

    private <T> ResponseEntity<APIResponse<T>> errorResponse(HttpStatus status, String message, List<ErrorDetail> errors) {
        APIResponse<T> response = APIResponse.error(message, errors, status);
        return new ResponseEntity<>(response, status);
    }

    private <T> ResponseEntity<APIResponse<T>> errorResponse(HttpStatus status, String message, ErrorDetail error) {
        return errorResponse(status, message, error != null ? List.of(error) : Collections.emptyList());
    }

    // ==================== CUSTOM EXCEPTIONS ====================

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<APIResponse<Object>> handleUnauthorizedException(UnauthorizedException ex) {
        return errorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(),
                new ErrorDetail("authorization", ex.getMessage()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<APIResponse<Object>> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = ex.getReason() != null ? ex.getReason() : status.getReasonPhrase();

        String field = switch (status) {
            case BAD_REQUEST -> "request";
            case NOT_FOUND -> "resource";
            case UNAUTHORIZED -> "token";
            case FORBIDDEN -> "authorization";
            case CONFLICT -> "database";
            default -> "error";
        };

        ErrorDetail errorDetail = new ErrorDetail(field, message);
        return errorResponse(status, message, errorDetail);
    }

    // ==================== VALIDATION & BINDING ====================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<APIResponse<Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<ErrorDetail> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> new ErrorDetail(fieldError.getField(), fieldError.getDefaultMessage()))
                .collect(Collectors.toList());

        return errorResponse(HttpStatus.BAD_REQUEST, "Validation failed", errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<APIResponse<Object>> handleConstraintViolation(ConstraintViolationException ex) {
        List<ErrorDetail> errors = ex.getConstraintViolations().stream()
                .map(cv -> new ErrorDetail(cv.getPropertyPath().toString(), cv.getMessage()))
                .collect(Collectors.toList());

        return errorResponse(HttpStatus.BAD_REQUEST, "Invalid input data", errors);
    }

    @ExceptionHandler(DateTimeParseException.class)
    public ResponseEntity<APIResponse<Object>> handleDateTimeParseException(DateTimeParseException ex) {
        return errorResponse(HttpStatus.BAD_REQUEST, "Invalid date format",
                new ErrorDetail("date", "Failed to parse date: " + ex.getParsedString()));
    }

    // ==================== REQUEST PARAMETERS ====================

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<APIResponse<Object>> handleMissingParameter(MissingServletRequestParameterException ex) {
        return errorResponse(HttpStatus.BAD_REQUEST, "Missing required parameter",
                new ErrorDetail(ex.getParameterName(), "This parameter is required"));
    }

    @ExceptionHandler(MissingPathVariableException.class)
    public ResponseEntity<APIResponse<Object>> handleMissingPathVariable(MissingPathVariableException ex) {
        return errorResponse(HttpStatus.BAD_REQUEST, "Missing path variable",
                new ErrorDetail(ex.getVariableName(), "Path variable is required"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<APIResponse<Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String type = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        return errorResponse(HttpStatus.BAD_REQUEST, "Invalid parameter type",
                new ErrorDetail(ex.getName(), "Expected type: " + type));
    }

    // ==================== HTTP & MEDIA TYPE ====================

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<APIResponse<Object>> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        return errorResponse(HttpStatus.METHOD_NOT_ALLOWED, "HTTP method not supported",
                new ErrorDetail("method", ex.getMessage()));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<APIResponse<Object>> handleUnsupportedMediaType(HttpMediaTypeNotSupportedException ex) {
        return errorResponse(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported media type",
                new ErrorDetail("content-type", ex.getMessage()));
    }

    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    public ResponseEntity<APIResponse<Object>> handleNotAcceptable(HttpMediaTypeNotAcceptableException ex) {
        return errorResponse(HttpStatus.NOT_ACCEPTABLE, "Media type not acceptable",
                new ErrorDetail("accept", ex.getMessage()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<APIResponse<Object>> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        return errorResponse(HttpStatus.BAD_REQUEST, "Malformed JSON request",
                new ErrorDetail("body", "Invalid JSON format or syntax error"));
    }

    @ExceptionHandler(HttpMessageNotWritableException.class)
    public ResponseEntity<APIResponse<Object>> handleMessageNotWritable(HttpMessageNotWritableException ex) {
        log.error("Failed to write response", ex);
        return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Response serialization error",
                new ErrorDetail("response", "Failed to generate response"));
    }

    // ==================== RESOURCE NOT FOUND ====================

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<APIResponse<Object>> handleNoResourceFound(NoResourceFoundException ex) {
        return errorResponse(HttpStatus.NOT_FOUND, "Static resource not found",
                new ErrorDetail("path", ex.getResourcePath()));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<APIResponse<Object>> handleEntityNotFound(EntityNotFoundException ex) {
        return errorResponse(HttpStatus.NOT_FOUND, "Entity not found",
                new ErrorDetail("entity", "No record found in database"));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<APIResponse<Object>> handleNoSuchElement(NoSuchElementException ex) {
        return errorResponse(HttpStatus.NOT_FOUND, "Resource not found",
                new ErrorDetail("id", "No element found with provided identifier"));
    }

    // ==================== SECURITY ====================

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<APIResponse<Object>> handleAccessDenied(AccessDeniedException ex) {
        return errorResponse(HttpStatus.FORBIDDEN, "Access denied",
                new ErrorDetail("authorization", "You do not have permission to access this resource"));
    }

    @ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
    public ResponseEntity<APIResponse<Object>> handleAuthenticationFailure(Exception ex) {
        return errorResponse(HttpStatus.UNAUTHORIZED, "Authentication failed",
                new ErrorDetail("token", "Invalid or missing credentials"));
    }

    // ==================== DATABASE ====================

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<APIResponse<Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return errorResponse(HttpStatus.CONFLICT, "Data conflict",
                new ErrorDetail("database", "Duplicate entry or constraint violation"));
    }

    // ==================== FALLBACK ====================

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<APIResponse<Object>> handleBadRequestException(BadRequestException ex) {
        return errorResponse(HttpStatus.BAD_REQUEST, "Bad request",
                new ErrorDetail("request", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<APIResponse<Object>> handleGenericException(Exception ex) {
        log.error("Unhandled exception occurred", ex);
        return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred",
                new ErrorDetail("server", "Please try again later or contact support"));
    }
}