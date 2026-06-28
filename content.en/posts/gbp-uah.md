---
title: "💸 Analysis: GBP → UAH transfers"
date: 2025-12-07
translationKey: "gbp-uah"
---
## Goal

Transfer GBP to UAH on a Monobank card with minimal losses, and preferably quickly.

## Exchange rate

As of Sunday, October 12, 2025, 12:00:

|  | **Google** | **Wise** |
| --- | --- | --- |
| **GBP → EUR** | 1.1494 | 1.1490 |
| **GBP → UAH** | 55.2353 | 55.1079 |
| **EUR → UAH** | 48.19 | 47.9408 |

## Comparison table

| **Method** | **Rate** | **Fee** | **Composite exchange rate** | **Speed** | **Notes** |
| --- | --- | --- | --- | --- | --- |
| Apple Pay | 55.1572 | 1.768% | 54.182 🔴 | Instant | Fixed fee |
| Revolut (EUR SEPA) | 55.05147 | 1% | 54.500 🟡 | 45 min | Weekend fee |
| Revolut (EUR SEPA) | 55.05147 | 0% | 55.052 🟢 | 45 min | No fee on weekdays |
| Wise (IBAN)* | 55.1079 | 1.52% | 54.270 🔴 | 25 min | Fee for £100 |
| Wise (IBAN)* | 55.1079 | 0.796% | 54.669 🟡 | 25 min | Fee for £500 |

\* – Wise allows a maximum of ₴30k = £543 per transfer.

## Details about each method

### Via Chase - Apple Pay

- Requested top up with 5500.00 UAH

- Chase charged 5599.00 UAH (exactly +1.8% by Apply Pay)
  - Reverse fee would be 0.01768173 (= 1 - 1 / 1.018) ~= 1.8% anyway

- Chase charged £101.51 (converted at 55.1572)

- Arrived instantly.

### Via Revolut - Mono:

- Revolut 100 GBP to EUR:
  - rate 100 gbp = 114.93 eur
  - Weekend fee 1% = 1.15 eur
  - Received €113.78
  - Instant

- Revolut eur to Mono eur:
  - Sent €113.78
  - Sent Sun 11:54
  - Received 12:39

- Mono Eur to Mono UAH:
  - Rate 47.90
  - No fees
  - Instant
  - €113.78 = 5450.06

### Via Wise - Mono UAH (via bank transfer):

- Sending £100
  - NOTE: currently can only send no more than 30k UAH ~= £543

- Fee £1.52
  - NOTE: the fee is progressively lower the more you send: £100 - £1.52, £500 - £3.98, £900 - £6.44

- Exchange 55.1079

- Receiving (100-1.52)*55.1079 = 5,427.026

- Sent Sun 12:13

- Received 12:36
