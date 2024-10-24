package com.example.demo.model.es;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
@Document(indexName = "health_records")
public class HealthRecordDocument {
    @Id
    private String id;

    @Field(type = FieldType.Integer)
    private Integer sbp;

    @Field(type = FieldType.Integer)
    private Integer dbp;

    @Field(type = FieldType.Keyword)
    private String isHeadache;

    @Field(type = FieldType.Keyword)
    private String isBackPain;

    @Field(type = FieldType.Keyword)
    private String isChestPain;

    @Field(type = FieldType.Keyword)
    private String isLessUrination;

    @Field(type = FieldType.Date)
    private ZonedDateTime importTime;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String description;

    @Field(type = FieldType.Long)
    private long userId;

    @Field(type = FieldType.Long)
    private long accountId;
}