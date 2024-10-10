package com.example.demo.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
public class HealthRecordDTO {
    private Integer SBP;//高压
    private Integer DBP;//低压
    private String isHeadache;//头痛
    private String isBackPain;//背痛
    private String isChestPain; //胸痛
    private String isLessUrination; //少尿
    private ZonedDateTime importTime;
    private String description;
}
