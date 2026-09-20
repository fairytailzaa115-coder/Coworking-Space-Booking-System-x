package com.coworking.booking.domain.model;

import com.coworking.booking.domain.strategy.IDiscountStrategy;
import com.coworking.booking.domain.strategy.StrategyFactory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * ENCAPSULATION & STRATEGY PATTERN HOLDER
 */
@Entity
@Table(name = "memberships")
@Getter
@Setter
@NoArgsConstructor
public class Membership {

    @Id
    @Column(name = "membership_id", length = 50)
    private String membershipId;

    @Column(name = "tier", unique = true, nullable = false)
    private String tier;

    @Column(name = "discount_rate", nullable = false)
    private BigDecimal discountRate;

    @Column(name = "max_monthly_hours", nullable = false)
    private Integer maxMonthlyHours;

    @Column(name = "price_monthly", nullable = false)
    private BigDecimal priceMonthly;

    @Transient
    private IDiscountStrategy discountStrategy;

    public Membership(String membershipId, String tier, BigDecimal priceMonthly) {
        this.membershipId = membershipId;
        this.tier = tier;
        this.priceMonthly = priceMonthly;
        this.discountStrategy = StrategyFactory.getStrategy(tier);
        this.discountRate = this.discountStrategy.getDiscountRate();
        this.maxMonthlyHours = this.discountStrategy.getMaxMonthlyHours();
    }

    public IDiscountStrategy getDiscountStrategy() {
        if (discountStrategy == null) {
            discountStrategy = StrategyFactory.getStrategy(this.tier);
        }
        return discountStrategy;
    }

    public BigDecimal calculateDiscount(BigDecimal rawAmount) {
        return getDiscountStrategy().calculateDiscount(rawAmount);
    }
}