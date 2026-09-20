package com.coworking.booking.domain.strategy;
import java.math.BigDecimal;
import java.math.RoundingMode;

public class ProDiscountStrategy implements IDiscountStrategy {
    private static final BigDecimal RATE = new BigDecimal("0.15");
    @Override
    public BigDecimal getDiscountRate() { return RATE; }
    @Override
    public int getMaxMonthlyHours() { return 80; }
    @Override
    public BigDecimal calculateDiscount(BigDecimal rawAmount) {
        return rawAmount.multiply(RATE).setScale(2, RoundingMode.HALF_UP);
    }
}