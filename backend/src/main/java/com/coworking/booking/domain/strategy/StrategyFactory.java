package com.coworking.booking.domain.strategy;

public class StrategyFactory {
    public static IDiscountStrategy getStrategy(String tier) {
        if (tier == null) return new BasicDiscountStrategy();
        switch (tier.toUpperCase()) {
            case "PRO": return new ProDiscountStrategy();
            case "ENTERPRISE": return new EnterpriseDiscountStrategy();
            case "BASIC":
            default: return new BasicDiscountStrategy();
        }
    }
}