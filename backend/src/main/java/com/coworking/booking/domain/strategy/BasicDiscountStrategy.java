package com.coworking.booking.domain.strategy;
import java.math.BigDecimal;
import java.math.RoundingMode;

public class BasicDiscountStrategy implements IDiscountStrategy {
    @Override
    public BigDecimal getDiscountRate() { return BigDecimal.ZERO; }
    @Override
    public int getMaxMonthlyHours() { return 20; }
    @Override
    public BigDecimal calculateDiscount(BigDecimal rawAmount) {
        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }
}