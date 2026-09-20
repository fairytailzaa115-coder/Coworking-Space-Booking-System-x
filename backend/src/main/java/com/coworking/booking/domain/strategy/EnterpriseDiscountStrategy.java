package com.coworking.booking.domain.strategy;
import java.math.BigDecimal;
import java.math.RoundingMode;

public class EnterpriseDiscountStrategy implements IDiscountStrategy {
    private static final BigDecimal RATE = new BigDecimal("0.30");
    @Override
    public BigDecimal getDiscountRate() { return RATE; }
    @Override
    public int getMaxMonthlyHours() { return 9999; }
    @Override
    public BigDecimal calculateDiscount(BigDecimal rawAmount) {
        return rawAmount.multiply(RATE).setScale(2, RoundingMode.HALF_UP);
    }
}