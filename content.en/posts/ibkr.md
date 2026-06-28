---
title: "🏦 Analysis: Interactive Brokers"
date: 2025-05-07
translationKey: "ibkr"
---
### Referral program

Please ping me if you’re interested in IBKR after reading this note, and I’ll share a referral link.

### Main use case

1. Deposit USD from the US;

1. Convert USD to GBP;

1. Buy UCITS ETFs using GBP, potentially (but not necessarily) within an ISA;

1. Eventually sell the ETFs and withdraw GBP.

> [!WARNING]
> ⚠️ IBKR is not happy when you only use their services to convert the currencies without further investing on their platform – they’ll be sending you a warning if you do so. If you’re not planning to use IBKR for investing, you should not use them for currency conversion either.

### Commissions and fees

Main source page: [ibkr.co.uk/commissions](http://ibkr.co.uk/commissions)

- **Depositing USD (via linked US account):** free

- **Converting USD to GBP:** 0.002% (min $2)

- **Trading ETFs in GBP (**[**source**](https://www.interactivebrokers.co.uk/en/pricing/commissions-stocks-europe.php?re=europe#:~:text=Switzerland%20%2D%20Examples-,UNITED%20KINGDOM,-GBP%20Denominated)**):**
  - Tiered: 0.05% (min £1) + exchange (0.0045%) + clearing fees (£0.06 flat)
  - Fixed - SmartRouting: 0.05% (min £3), no fees _← which is why I’m currently on Fixed_
  - Fixed - Direct routing: 0.10% (min £4), no fees

- **Withdrawing GBP:** 1 free per month, then £1 per withdrawal

- **Account maintenance fees:**
  - General Investment Account fee: none
  - ISA fee ([source](https://www.interactivebrokers.co.uk/en/trading/isa-accounts.php)): minimum monthly activity fee of £3

### USD-GBP conversion example

On March 30, 2023, based on $10k conversion:

- Google rate: GBP 1 = USD 1.23489, fee: N/A

- **IBKR rate: GBP 1 = USD 1.23504, fee: $2 (fixed)**

- Revolut rate: GBP 1 = 1.2357 USD, fee: £84 / year (fixed)

- Wise rate: GBP 1 = USD 1.23500, fee: $32.89 (variable)

### Time frames

- **Depositing USD (via linked US account):** 1 business day

- **Converting USD to GBP:** instant

- **Trading ETFs in GBP:** instant

- **Withdrawing GBP:** 3 business days

### Pros and cons

- ✅ Low fees.

- ✅ Very detailed reports in the Performance & Reports tab.

- 🚫 You can’t use IBKR to transfer-convert-withdraw GBP immediately. 
  - IBKR is not just a bank, it’s primarily an investment platform, so if you don’t invest GBP and instead just withdraw it immediately – you’ll get a warning from IBKR, and eventually will have your account restricted.

- 👎 Crappy UI: 
  - Slow to load, sometimes just loads forever after navigating to a page;
  - Not noob-friendly;
  - The “Transfer & Pay” tab just doesn’t load half of the times.
  - Does crazy rounding on mobile app

> [!NOTE]
> 💡 The best way to see the activity and the snapshot of the account is to generate an activity statement: Performance & Reports → Statements → Activity → Year to Date.

### FAQ

- **What does PRO mean in IBKR PRO?**
  - In the US, there is an IBKR Lite version. But it’s not available for UK-domiciled customers.

- **What is SmartRouting?**
  - SmartRouting is an automated system that searches multiple market centers and exchanges to identify the best available bid and ask prices for a given security.
  - SmartRouting was applied to my purchase of VUSA ETF on the Fixed tier.

- **What is the interest rate on the cash credit?**
  - For GBP, it’s 3.275% for credit above £8,000 ([source](https://www.interactivebrokers.co.uk/en/accounts/fees/pricing-interest-rates.php)).

- **What are Live and Paper options?**
  - Live is your real account. Paper is a simulator where you start with 1M GBP.

- **Do I need to file a W8-BEN form?**
  - Upon creating an account, a Combined CRS/IRS Tax Form is created that is a substitute for W8-BEN. To view the form, go to Settings → click on your name above the ‘Account Holder’, check the ‘Tax Forms’ list item (last row of the list).
