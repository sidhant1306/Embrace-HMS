package com.example.hms.dto.validation;

import java.util.Map;

public record ValidationErrorResponse(String message, Map<String, String> fieldErrors) {
}
