---
title: "🏦 [SOLVED] Estimated £422,800 of donations to Ukraine are stuck in J.P. Morgan Chase"
date: 2022-08-30
translationKey: "donations-to-ukraine-stuck-in-jpmorgan"
---
---

## ✅ UPDATE 2022/09/07: Money reached the NBU!

Accidents happen. Luckily, the world is full of great people to help with the recovery.

Turns out, some folks in J.P. Morgan Chase noticed the payments early on, and took an action fairly quickly to forward the funds to the National Bank of Ukraine. 

Quote from a J.P. Morgan Chase employee:

> [!NOTE]
> The issue was resolved and the funds were credited to the correct account of Bank of Ukraine.
>
> The account quoted wasn’t a valid account so they did not go into an incorrect account but went into a repair queue.
>
> There was enough referencing in the payments to conclude that the ultimate beneficiary of the intended payments was Bank Of Ukraine’s account held with JPMorgan and following much internal consultation the funds were applied correctly.

Quote from another employee regarding my individual donation:

> [!NOTE]
> We have been continuing our investigation into this matter and have more positive news.
>
> The transaction in question for GBP x,xxx.xx with related reference `SUPPORTING UA ARMY`, remittance info `RC/xxxxxxxxxxxxxxxxxxx` was part of bulk credit for GBP xxx,xxx.xx. This was applied on the 07th March to National Bank of Ukraine's account with a back value date of 28th Feb. We hope with this information that you can reassure the remitter that the funds were received by National Bank of Ukraine, even though the account number quoted in the instruction was incorrect.

I feel deeply grateful to everyone who was involved in the investigation and the recovery of these misdirected funds. Thanks to your efforts, the defenders of Ukraine received the critical support they desperately needed in the very first days of the war, and the volunteers can finally have a peace of mind that their donations indeed reached Ukraine.

Thank you. ✊🇺🇦❤️

I’ll keep this page alive for historical purpose, but I’m feeling relieved to finally say that this problem is solved and the case is closed.

---

## 🎯 TL;DR:

- I have reasons to believe that £422,800 worth of donations to Ukraine is currently stuck with J.P. Morgan Chase due to a mistake.

- All the requests and complaints to J.P. Morgan Chase are being ignored for 6 months now.

- If you can, please help the money to reach the intended destination.

## 📚 Context

#### Fact 1: UK wire transfers should bounce back if an account doesn’t exist

{{% details "Click the arrow to learn where John Smith keeps his money." %}}
In the UK, domestic wire transfers (a.k.a. Faster Payments, FPS) are made using the following payee details:

- Recipient’s name (e.g. `John Smith`);

- Sort code – 6-digit identifier of a specific bank branch (e.g. `12-34-56`);

- Account number – 8-digit identifier of an account within the branch (e.g. `12345678`).

That’s all you need to know to make a payment – a name, a sort code, and an account number.

If an account matching the details doesn’t exist, the recipient bank is supposed to reject the transaction. In this case, the sender observes the payment “bouncing back” into their account shortly after it is sent.
{{% /details %}}

#### Fact 2: National Bank of Ukraine is running fundraisers since February

{{% details "Click the arrow to learn how NBU is helping Ukraine." %}}
The National Bank of Ukraine (NBU) is Ukraine's primary governmental financial institution – similar to the Bank of England here in England. 

Since 25th February 2022, shortly after Russia started the full-scale invasion of Ukraine, NBU has been running the official governmental fundraiser campaigns for the Armed Forces and Humanitarian Aid. In the first days of the full-scale war, NBU was the single most trustworthy fundraiser at the time.

There were many British citizens and Ukrainian residents of the UK who wanted to help Ukraine. For fundraising in British pounds (GBP), NBU opened an account in J.P. Morgan Chase. The account details are available by the links at the top of the [bank's homepage](https://bank.gov.ua/en/).
{{% /details %}}

## 🧐 Crucial mistake of the National Bank of Ukraine

#### Non-existent account details provided by NBU

In the first days of war, due to the chaos and human error, the maintainers of the official NBU website listed incorrect information for GBP payments for about 2 days.

During February 25-26, the payment details mentioned the correct sort-code in J.P. Morgan Chase bank, but an account number from their other account with the Bank of England.

Click the image to enlarge and see the details:

{{< image src="/assets/nbu_payments_v3.png" alt="NBU payment details showing the incorrect GBP account number" >}}

#### Evidence of the honest mistake

{{% details "Click the arrow to learn more." %}}
There’s plenty of evidence confirming what happened:

{{% details "Internet Archive snapshots of the NBU’s website shows that incorrect account details remained published for about 18 hours on Feb 25-26" %}}
- [Feb 25, 17:57 GMT](https://web.archive.org/web/20220225175703/https://bank.gov.ua/en/news/all/natsionalniy-bank-vidkriv-spetsrahunok-dlya-zboru-koshtiv-na-potrebi-armiyi) – no FPS (8-digit) account number

- [Feb 25, 18:21 GMT](https://web.archive.org/web/20220225182138/https://bank.gov.ua/en/news/all/natsionalniy-bank-vidkriv-spetsrahunok-dlya-zboru-koshtiv-na-potrebi-armiyi) – non-existent FPS account number (first confirmed occurrence)

- [Feb 26, 11:32 GMT](https://web.archive.org/web/20220226113250/https://bank.gov.ua/en/news/all/natsionalniy-bank-vidkriv-spetsrahunok-dlya-zboru-koshtiv-na-potrebi-armiyi) – non-existent FPS account number (last confirmed occurrence)

- [Feb 26, 13:49 GMT](https://web.archive.org/web/20220226134930/https://bank.gov.ua/en/news/all/natsionalniy-bank-vidkriv-spetsrahunok-dlya-zboru-koshtiv-na-potrebi-armiyi) – no FPS account number
{{% /details %}}

{{% details "The official website of the Government of Ukraine shows that the “incorrect” account number is taken from the NBU’s account in the Bank of England" %}}
- [Government portal](https://www.kmu.gov.ua/en/news/specialnij-rahunok-dlya-zboru-koshtiv-na-pidtrimku-zbrojnih-sil-ukrayini) ([Internet Archive snapshot](https://web.archive.org/web/20220803065310/https://www.kmu.gov.ua/en/news/specialnij-rahunok-dlya-zboru-koshtiv-na-pidtrimku-zbrojnih-sil-ukrayini))
{{% /details %}}

{{% details "Random third-party websites that copied the incorrect details and surface them up to this day" %}}
- [Greater Govanhill](https://www.greatergovanhill.com/latest/ukrainians-in-glasgow-speak-out) ([Internet Archive snapshot](https://web.archive.org/web/20220226143923/https://www.greatergovanhill.com/latest/ukrainians-in-glasgow-speak-out))

- [Ukrainian Truth](https://www.pravda.com.ua/eng/news/2022/03/3/7327850/)
{{% /details %}}

All of the above clearly shows that account number `40000982` exists in the Bank of England, but doesn’t exist in J.P. Morgan Chase’s branch with sort code `60-92-42`, and never did.
{{% /details %}}

#### Probabilistic proof of non-existence of the account

{{% details "There’s some boring pseudo-math inside, click the arrow if you’re really curious." %}}
Let’s ignore the name on the account for a second. What are the chances that account number `40000982` exists in J.P. Morgan Chase’s branch `60-92-42` at all, under some other name?

I found several websites providing the list of all UK sort codes – around 18,100 sort codes in total ([source 1](https://www.robertsharp.co.uk/2017/11/25/all-the-uk-and-ireland-bank-sort-codes/), [source 2](https://cybercrew.uk/blog/uk-banks-routing-numbers/)). 

HM Treasury [reports](https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/949475/Basic_bank_account_report__003_.pdf) that as of June 2020, the 9 largest banks had a total of 7.2M basic accounts opened with them. This figure doesn’t include business accounts and smaller banks, so to be safe, let’s just make it 10x larger, estimating that there are 72M bank accounts opened in the UK.

72M accounts in 18k branches means that on average, there is roughly 4000 accounts per sort code. Obviously, high street banks will have more customers, and specialised institutions serving National Banks of other countries will have fewer accounts, but let’s ignore that.

Finally, each sort code can have any 8-digit combination as an account number – that’s 100M combinations.

If the sort code `60-92-42` has 4000 existing accounts, and you send money to one of the 100M possible account numbers – your chances of hitting a real account are 4000 our of 100,000,000. 

That’s 0.004%.

And that’s based on some optimistic assumptions. The fewer real accounts within a sort code – the lower your chances will be.

The point is that, probabilistically speaking, it’s very unlikely that an account `40000982` exists at all, even under a different owner.
{{% /details %}}

#### My own payment info

Below is the information about a specific payment I made on the 26th February 2022. Some information is hidden for privacy purposes, but I’m ready to provide the complete details to anyone with a `@jpmorgan.com` or `@chase.com` email address, or similar.

{{% details "Click the arrow to learn more." %}}
| **Sender info** | |
| --- | --- |
| Sender | Oleksandr Bashuk |
| Sender bank name | Santander UK PLC |
| Sender bank BIC | ABBYGB2LXXX |
| Sender bank sort code | 09-01-29 |
| Sender account number | _(hidden)_ |
| **Non-existing recipient info** | |
| Beneficiary name | National Bank of Ukraine |
| Beneficiary bank name | JP Morgan Chase |
| Beneficiary bank BIC | CHASGB2L |
| Beneficiary sort code | 60-92-42 |
| Beneficiary account number | 40000982 (wrong) |
| **Payment info** | |
| Payment amount | _(hidden)_ |
| Payment date | 26th February 2022 |
| Payment reference | SUPPORTING UA ARMY |
| Transaction reference number | _(hidden)_ |
{{% /details %}}

## ⚠️ Why J.P. Morgan Chase is also responsible

Firstly, since account number `40000982` (wrong) was taken from a different bank, it most likely doesn’t exist in J.P. Morgan Chase’s branch with sort code `60-92-42`. J.P. Morgan Chase should’ve declined the incoming payment, but it didn’t.

Secondly, even after J.P. Morgan Chase accepted the payment, it should’ve reverted it after numerous requests from Santander (sender bank) and the National Bank of Ukraine (intended beneficiary) – because quite evidently, this money was sent to a wrong, non-existent account. But J.P. Morgan Chase didn’t.

After 6 months of ignoring all the requests and complaints from both the NBU representatives and me, J.P. Morgan Chase still keeps the money.

## 📊 Impact estimation

#### **Estimation for the whole UK**

There are around 42,280 Ukrainians living in the UK.

{{% details "Click the arrow to learn how I figured that out." %}}
According to [2021 census data](https://commonslibrary.parliament.uk/how-many-ukrainians-live-in-the-uk/), approximately 37,530 people were born in Ukraine and were usual residents in England and Wales in March 2021. 

According to [Wikipedia summary](https://en.wikipedia.org/wiki/Countries_of_the_United_Kingdom_by_population) based on the same 2021 census, the total population of England and Wales combined is 56.17M people, while the total for Scotland and Northern Ireland is 7.11M.

Assuming that the density of Ukrainians throughout the UK roughly matches the density of overall population, it’s fair to estimate that in 2021 there were 42,280 Ukrainians residing in the UK:

| | Total Population ([source](/posts/donations-to-ukraine-stuck-in-jpmorgan/)) | Ukrainians |
| --- | --- | --- |
| England + Wales | 53.11M + 3.06M = 56.17M | 37,530 ([source](https://commonslibrary.parliament.uk/how-many-ukrainians-live-in-the-uk/)) |
| Scotland + Northern Ireland | 5.30M + 1.81M = 7.11M | 4,750 (est.) |
| Total in the UK | 63,285,145 | 42,280 (est.) |
{{% /details %}}

If every 10th Ukrainian donated £100 on average, then we're talking about £422,800 that was lost and never reached Ukraine. I firmly believe **this estimation is a lower bound**, as it doesn't take into account hundreds of non-Ukrainians who also helped Ukraine.

None of the donations reached their destination. NBU hasn't received the money, and senders neither got it back nor were notified that the recipient account doesn’t exist – most people aren’t even aware of the problem up to this day.

#### **My own social bubble**

Within my circle of about 15 Ukrainian friends in London, 3 of us sent money to this non-existing payee, totalling £11,900 in donations. We all discovered and used these payee details separately and independently, without talking to each other.

That's roughly one out of five people, with an average donation of almost £4,000 per person.

## 📣 Requests and complaints (spoiler: no results)

For the last 6 months I’ve been trying to get J.P. Morgan Chase’s attention to the problem. They rejected my bank’s requests to recall the payment, ignored my emails and letters, and gave very unclear and indefinitive replies to NBU.

{{% details "Click the arrow to see a looong list of complaints." %}}
| When | Who to whom | What | Response |
| --- | --- | --- | --- |
| February 26, 2022 | Alex → Santander (sender bank) | Request to recall the payment | Santander: “J.P. Morgan Chase refused to revert the transaction” |
| February 28, 2022 | Alex → NBU | Request to confirm the receipt of funds. | NBU: “NBU hasn’t received the payment, as wrong account number was used” |
| April 11, 2022 | NBU → J.P. Morgan Chase | Request to locate and forward the payment from Alex | J.P. Morgan Chase: “We’re looking into it” |
| April 20, 2022 | NBU → J.P. Morgan Chase | Request to locate and forward the payment from Alex | J.P. Morgan Chase: “We’re looking into it” |
| May 23, 2022 | NBU → J.P. Morgan Chase | Request to locate and forward the payment from Alex | J.P. Morgan Chase: “We couldn’t locate the payment, but we’ll try to escalate this case” |
| June 17, 2022 | Alex → Santander (sender bank) | Request to recall the payment or forward the transaction to the correct account number | Santander: “J.P. Morgan Chase refused to look into the duplicate request” |
| July 13, 2022 | Alex → Santander (sender bank) | Written complaint via letter with a request to recall the payment | Santander: “The beneficiary has declined to return the funds and Santander are not able to assist further” |
| July 13, 2022 | NBU → J.P. Morgan Chase | Request to provide an official written reply to the requests from the past | J.P. Morgan Chase: “Can’t provide a final reply yet, still looking into it” |
| July 22, 2022 | Alex → J.P. Morgan Chase | Written complaint via letter with a request to recall the payment | None. |
{{% /details %}}

## 🙏 Help needed

> [!NOTE]
> ✅ **NOTE:** This case is closed, help is no longer required – please check out the top of the page. I thank everyone who helped to investigate and recover the misdirected payments!
>
> The section below is preserved as-is for historical purpose, please take no further action.

This money doesn’t belong to anyone but the people of Ukraine who desperately need it right now. Recovering these payments is vitally important and will help to save many Ukrainians lives.

#### **If you work for J.P. Morgan Chase (or know anyone who does)**

Please help me to get the attention of the bank to this issue. I’m ready to provide any details from my side about my individual donation, but generally, we need to recover any payments sent using the following details:

- Beneficiary name: `National Bank of Ukraine`

- Beneficiary sort code: `60-92-42`

- Beneficiary account number: `40000982` (wrong)

All such payments need to be forwarded to the correct account of the National Bank of Ukraine, using the up-to-date payment details from [the NBU’s website](https://bank.gov.ua/en/about/support-the-armed-forces).

If you know anyone who works for J.P. Morgan Chase, please share the link to this page with them, and ask them to help. Thanks!

[https://bashuk.net/posts/donations-to-ukraine-stuck-in-jpmorgan/](https://bashuk.net/posts/donations-to-ukraine-stuck-in-jpmorgan/)

#### If you’re a journalist or a public figure

Please help me to raise the awareness of this issue. The more people know about the problem, the sooner we’ll get this resolved by J.P. Morgan Chase.

#### If you donated funds to Ukraine in February

First of all, a massive thank you. It was a critical time for our country, and all donations were invaluable.

Second of all, please check the details of your payments, there is a chance that your donation was also affected by the same problem. 

If you sent any money to the account `40000982`, please let me know. The more people we find, the stronger the case, the higher the chances for a successful outcome.

## ✉️ My contact info

Here’s how you can get in touch with me:

- Email: _(hidden)_

- Facebook: _(hidden)_

Glory to Ukraine! Слава Україні! ✊🇺🇦❤️
