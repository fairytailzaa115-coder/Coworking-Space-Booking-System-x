package com.coworking.booking.repository;

import com.coworking.booking.domain.model.LineSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LineSettingRepository extends JpaRepository<LineSetting, String> {
}
