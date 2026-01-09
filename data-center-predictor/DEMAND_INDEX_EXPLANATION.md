# Understanding the Demand Index

## What the Numbers Mean

The **Demand Index** is a **composite, relative indicator** - not an absolute measurement. It represents predicted data center demand based on multiple market indicators.

## How It's Calculated

The index combines four normalized factors:

1. **Exponential Growth Trend (40% weight)**
   - Represents the natural exponential growth in data center demand over time
   - Formula: `exp(0 to 2)` over the time period
   - This captures the long-term upward trend in data center infrastructure

2. **Tech Stock Performance (30% weight)**
   - Average of major tech company stock prices (Meta, Google, Microsoft, Apple, Amazon)
   - Normalized: `(current_price / initial_price) * 100`
   - Higher stock prices indicate stronger company growth → more data center demand

3. **Copper Prices (20% weight)**
   - Copper is essential for data center infrastructure (wiring, cooling systems)
   - Normalized: `(current_price / initial_price) * 50`
   - Higher copper prices suggest increased infrastructure investment → more demand

4. **Energy Costs (10% weight)**
   - Energy ETF prices (inverse relationship)
   - Normalized: `(initial_price / current_price) * 30`
   - Lower energy costs make data centers more feasible → higher demand

## Key Characteristics

### Not Normalized in Traditional Sense
- The numbers are **not** z-scores (mean=0, std=1)
- The numbers are **not** min-max normalized (0-1 range)
- Instead, they're a **weighted composite** of normalized indicators

### Relative, Not Absolute
- The numbers represent **trends and relative changes**, not absolute quantities
- A value of 150 doesn't mean "150 data centers" or "150 MW"
- It means the predicted demand is 50% higher than the baseline

### Interpretation
- **Higher values** = Higher predicted demand
- **Increasing trend** = Growing demand
- **Percentage changes** = Relative growth/decline
- **Comparisons** = Compare values over time, not to external benchmarks

## Example

If the index shows:
- **Current**: 120
- **Projected (30 days)**: 135
- **Change**: +12.5%

This means:
- Predicted demand is expected to increase by 12.5% over 30 days
- The composite of all indicators suggests growing demand
- The trend is positive based on current market conditions

## Why This Approach?

Since we don't have actual data center demand data (which is proprietary and not publicly available), we create a synthetic target that:
- Reflects real market drivers of data center demand
- Uses publicly available, reliable data sources
- Captures relationships between economic indicators and infrastructure needs
- Provides actionable insights for investment decisions

## Limitations

- The index is **relative** - use it to track trends, not absolute values
- It's based on **market indicators**, not actual data center metrics
- The weights (40/30/20/10) are assumptions based on industry knowledge
- For absolute demand numbers, you'd need proprietary data from hyperscalers

## Use Cases

The index is useful for:
- **Trend analysis**: Is demand increasing or decreasing?
- **Comparative analysis**: How does current demand compare to past periods?
- **Forecasting**: What's the predicted direction over the next 30/60/90 days?
- **Investment timing**: When might be a good time to invest in green materials?

## Technical Details

The final index value is calculated as:
```
Demand Index = (base_trend * 0.4) + 
               (tech_influence * 0.3) + 
               (copper_influence * 0.2) + 
               (energy_influence * 0.1) + 
               noise
```

Where each component is normalized relative to its starting value, ensuring the index reflects changes from the baseline period.
