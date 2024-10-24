package com.example.demo.utility.converter;

import com.example.demo.model.Account;
import com.example.demo.model.dto.AccountDTO;

public class AccountConverter {
    public static AccountDTO toAccountDTO(Account account) {
        AccountDTO dto = new AccountDTO();
        dto.setName(account.getAccountName());
        return dto;
    }
}
