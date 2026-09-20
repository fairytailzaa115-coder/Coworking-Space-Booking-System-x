package com.coworking.booking.repository;

import com.coworking.booking.domain.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByMemberIdOrderByCreatedAtDesc(String memberId);
       List<Booking> findByStatusOrderByCreatedAtAsc(String status);
    List<Booking> findByRoomIdAndStatusIn(String roomId, List<String> statuses);

    @Query("SELECT b FROM Booking b WHERE b.roomId = :roomId " +
           "AND b.status != 'CANCELLED' " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(@Param("roomId") String roomId,
                                         @Param("startTime") Instant startTime,
                                         @Param("endTime") Instant endTime);
}