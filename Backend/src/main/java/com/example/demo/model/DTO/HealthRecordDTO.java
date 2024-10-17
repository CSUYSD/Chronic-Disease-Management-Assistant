package com.example.demo.model.DTO;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
public class HealthRecordDTO {
    @Digits(integer = 3, fraction = 0, message = "SBP must be a numeric value with up to 3 digits")
    private Integer SBP; // Systolic Blood Pressure, up to 3 digits

    @Digits(integer = 3, fraction = 0, message = "DBP must be a numeric value with up to 3 digits")
    private Integer DBP; // Diastolic Blood Pressure, up to 3 digits

    @Pattern(regexp = "YES|NO", message = "Headache status must be 'YES' or 'NO'")
    private String isHeadache; // Headache

    @Pattern(regexp = "YES|NO", message = "Back pain status must be 'YES' or 'NO'")
    private String isBackPain; // Back pain

    @Pattern(regexp = "YES|NO", message = "Chest pain status must be 'YES' or 'NO'")
    private String isChestPain; // Chest pain

    @Pattern(regexp = "YES|NO", message = "Less urination status must be 'YES' or 'NO'")
    private String isLessUrination; // Less urination

    @NotNull(message = "Import time cannot be null")
    private ZonedDateTime importTime; // Import time

    private String description; // Description


}
