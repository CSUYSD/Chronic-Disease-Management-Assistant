package com.example.demo.Dao;

import com.example.demo.model.HealthRecord;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordDao extends JpaRepository<HealthRecord, Long> {
    // 根据账户ID获取所有交易记录
    @Query(value = "SELECT * FROM transaction_record WHERE account_id = ?1", nativeQuery = true)
    List<HealthRecord> findAllByAccountId(Long accountId);

    // 根据ID和账户ID获取记录
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM transaction_record WHERE type = ?1 AND account_id = ?2", nativeQuery = true)
    List<HealthRecord> findByAccountIdAndType(String type, Long accountId);

    // 根据多个ID和账户ID批量获取记录
    List<HealthRecord> findAllByIdInAndAccountId(List<Long> ids, Long accountId);

    @Query(value = "SELECT * FROM transaction_record WHERE account_id = :accountId ORDER BY transaction_time DESC, id DESC LIMIT :duration", nativeQuery = true)
    List<HealthRecord> findCertainDaysRecords(Long accountId, Integer duration);
}
