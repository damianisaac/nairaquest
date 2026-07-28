import type { Question } from '../../types';

const questions: Question[] = [

  // ── KIDS / EASY ──────────────────────────────────────────────────────────────

  {
    id: 'os-001',
    text: 'You are playing a game on your phone and a message pops up saying "Buy 500 coins for ₦1,000!" What should you do first?',
    options: [
      'Buy the coins right away so you can keep playing',
      'Ask a parent or guardian before spending any real money',
      'Enter any card number you can find at home',
      'Ignore all messages in games forever',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'online-safety',
    explanation:
      'Game coins cost real money from a real bank account. Always ask a parent or guardian first — they can help decide if it is worth it and make sure the purchase is safe.',
    consequenceReplay: {
      scenario: 'Tope taps "Buy Now" on a ₦1,000 coin pack without asking.',
      outcome: 'The money is charged directly to his mum\'s debit card. She notices ₦1,000 gone from her account and Tope misses out on a family treat because the money was already spent.',
      lesson: 'In-app purchases charge real money instantly. Always ask first.',
    },
  },

  {
    id: 'os-002',
    text: 'A pop-up on your game says "You WON! Enter your mum\'s card number to claim your prize!" What is the right thing to do?',
    options: [
      'Enter the card number quickly before the prize expires',
      'Close the pop-up and tell a trusted adult',
      'Share the pop-up with your friends',
      'Enter a made-up card number to see what happens',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'online-safety',
    explanation:
      'Real prizes never require you to enter a card number. This is a trick to steal money. Close it immediately and tell a trusted adult what you saw.',
  },

  {
    id: 'os-003',
    text: 'Which of these is safe to share with a stranger online?',
    options: [
      'Your home address',
      'Your parent\'s phone number',
      'Your first name only',
      'Your school name and class',
    ],
    correctIndex: 2,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'online-safety',
    explanation:
      'Only your first name is safe. Your address, your parent\'s number, and your school name can all be used by bad people to find you or trick your family.',
  },

  {
    id: 'os-004',
    text: 'You want to buy a toy you saw advertised on a website. The price is incredibly cheap — much lower than any shop. What should you do?',
    options: [
      'Order it immediately before the price goes up',
      'Tell a parent and ask them to check if the website is real',
      'Pay with your dad\'s card without telling him',
      'Share the link with all your friends so they can buy too',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'online-safety',
    explanation:
      'Prices that are too cheap are often a trap — either the item never arrives or it is broken. A parent can help check if the website is trustworthy before any money is spent.',
  },

  {
    id: 'os-005',
    text: 'A game asks you to watch an advert to get free coins. What is most likely true?',
    options: [
      'The game company is giving you free money',
      'The game company earns real money when you watch the ad',
      'The advert is secretly stealing your data',
      'It is always a trap and you should never do it',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'online-safety',
    explanation:
      'Watching an ad to earn in-game rewards is usually safe. The game company gets paid by advertisers when you watch, and you get free coins. It is a fair trade — no real money leaves your account.',
  },

  {
    id: 'os-006',
    text: 'What does "in-app purchase" mean?',
    options: [
      'A free bonus inside the game',
      'Buying something inside an app using real money',
      'A secret cheat code',
      'An update that makes the game better for free',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'online-safety',
    explanation:
      'In-app purchases are real money transactions that happen inside a game or app. Even if they look like game coins or gems, they come out of a real bank account or card.',
  },

  {
    id: 'os-007',
    text: 'Someone in your online game chat says "Send me your phone number and I will send you free game skins." What should you do?',
    options: [
      'Share your number — free skins are worth it',
      'Ask your friends if they have tried it first',
      'Refuse, block the person, and tell a trusted adult',
      'Share your number but use your older sibling\'s number instead',
    ],
    correctIndex: 2,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'online-safety',
    explanation:
      'Strangers who ask for your phone number online are not safe, no matter what they offer. Real game rewards never require sharing personal details. Block them and tell a trusted adult.',
  },

  {
    id: 'os-008',
    text: 'A "loot box" in a game means you pay real money but don\'t know exactly what you will get. This is similar to:',
    options: [
      'Saving money in a piggy bank',
      'Gambling, because the outcome is random',
      'A gift from the game makers',
      'A guaranteed rare item',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'online-safety',
    explanation:
      'Loot boxes work like gambling — you spend real money but the reward is random. Game companies design them to feel exciting, but you could spend a lot of money and get very little in return.',
  },

  {
    id: 'os-009',
    text: 'Your friend says "I found a website where you can get Robux for free, you just need to log in with your Roblox password." What should you do?',
    options: [
      'Try it — free Robux is always worth it',
      'Refuse, because sharing your password lets strangers take your account',
      'Share your password but change it right after',
      'Tell all your friends so they can get free Robux too',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'online-safety',
    explanation:
      'No legitimate website gives away free Robux or game currency in exchange for your password. These sites steal your account. Never share your game passwords with anyone — not even friends.',
  },

  {
    id: 'os-010',
    text: 'Which is the safest way to pay for something online?',
    options: [
      'Direct bank transfer to a stranger\'s personal account',
      'Sending cash in an envelope',
      'Using a trusted payment platform like Paystack or Flutterwave with a parent\'s help',
      'Giving your full card details in a WhatsApp chat',
    ],
    correctIndex: 2,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'online-safety',
    explanation:
      'Trusted payment platforms provide protection and receipts. Sending money directly to a stranger\'s account or sharing card details in chat offers no protection if something goes wrong.',
  },

  // ── TEENS / MEDIUM ───────────────────────────────────────────────────────────

  {
    id: 'os-011',
    text: 'You receive a text: "URGENT: Your GTBank account will be blocked. Reply with your OTP now to verify." What should you do?',
    options: [
      'Reply with the OTP immediately to save your account',
      'Delete the message — banks never ask for your OTP by text',
      'Forward it to your parents so they can handle it',
      'Reply asking the sender to prove they are from GTBank',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'online-safety',
    explanation:
      'OTP stands for One-Time Password. It is the only key to authorise a transaction. No bank, fintech, or legitimate business will ever ask for your OTP via text, phone, or chat. Sharing it lets fraudsters steal money instantly.',
    consequenceReplay: {
      scenario: 'Emeka replies with his OTP, thinking he is saving his account.',
      outcome: 'Within 90 seconds, ₦58,000 is transferred out of his account to an unknown number. The fraudster used the OTP to authorise the transfer. His bank says they cannot reverse it because he authorised it himself.',
      lesson: 'Your OTP is like a vault key. The moment someone else has it, the vault is theirs. Never share it with anyone for any reason.',
    },
  },

  {
    id: 'os-012',
    text: 'A WhatsApp account claiming to be "BetWay Sure Tips" sends you a message saying they guarantee you will win 10x your stake every weekend. How should you respond?',
    options: [
      'Follow all their tips — guaranteed wins are real',
      'Be very skeptical. No one can guarantee betting outcomes, this is a trap',
      'Share it with friends so everyone can win together',
      'Bet your full allowance this weekend to test it',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'online-safety',
    explanation:
      'Betting outcomes are never guaranteed. "Sure tip" accounts make money by charging subscription fees or scamming followers who believe the hype. Betting companies are built so that the house wins over time — no tipster can change that math.',
    consequenceReplay: {
      scenario: 'Fatima pays ₦3,000 for a "VIP sure tip" and bets her ₦10,000 allowance on it.',
      outcome: 'The tip loses. She is now ₦13,000 down and the "Sure Tips" account has disappeared from WhatsApp. She misses her school excursion payment.',
      lesson: 'Betting "guarantees" are always lies. The only person who wins is the one selling the tips.',
    },
  },

  {
    id: 'os-013',
    text: 'What is the main reason betting companies are not a reliable way to make money?',
    options: [
      'Because only adults are allowed to bet',
      'Because the odds are set so the company profits over time, not the bettor',
      'Because the government takes all the winnings',
      'Because you need a special licence to collect winnings',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'online-safety',
    explanation:
      'Betting companies set odds so they keep a percentage of every bet placed — called the "house edge." Over thousands of bets, they always come out ahead. Some people win sometimes, but statistically most bettors lose money over time.',
  },

  {
    id: 'os-014',
    text: 'You see a social media post: "Follow and repost this page — we are giving away ₦50,000 to 10 lucky winners!" Which is true?',
    options: [
      'Legitimate brands run giveaways this way all the time',
      'It is likely a follower-farming tactic or a scam to collect your details',
      'You should follow and repost to improve your chances',
      'You should DM them your account number to get the prize',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'online-safety',
    explanation:
      'Most social media "giveaways" are designed to rapidly grow an account\'s following for future sale or to collect personal data. If a giveaway asks for your account number in DMs, it is definitely a scam.',
  },

  {
    id: 'os-015',
    text: 'A stranger you met online says they are a rich oil worker. After chatting for two weeks they say they need you to send ₦5,000 for an emergency — they will pay you back ₦50,000. This is most likely:',
    options: [
      'A genuine emergency from a trusted contact',
      'A romance/relationship scam designed to trick you into sending money',
      'A legitimate loan arrangement',
      'A misunderstanding — just send the money to help',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'online-safety',
    explanation:
      'Romance scams build trust over weeks or months before asking for money. The "emergency" story and promise of a larger return are classic hooks. Once you send money, the person disappears — and there is no oil worker.',
  },

  {
    id: 'os-016',
    text: 'You sign up for a "free 30-day trial" on a streaming app. What is the most important thing to check?',
    options: [
      'Whether the app has Nigerian content',
      'Whether it automatically charges your card after the trial ends',
      'Whether there is a student discount',
      'Whether your friends already use it',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'online-safety',
    explanation:
      'Most free trials require card details upfront and auto-renew when the trial ends. If you do not cancel before day 30, you are charged — often without a reminder. Always check the cancellation terms before signing up.',
  },

  {
    id: 'os-017',
    text: 'A website is selling the latest iPhone at ₦50,000 — far below every other store. Which action is safest?',
    options: [
      'Buy immediately before stocks run out',
      'Verify the website, check reviews, and use a payment method with buyer protection',
      'Pay by direct bank transfer since it feels more personal',
      'Order it and dispute later if something is wrong',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'online-safety',
    explanation:
      'Prices far below market value are a major red flag for fake or non-existent products. Always verify a seller — check Google reviews, Trustpilot, or social media before buying. Avoid direct bank transfers to individuals; use platforms with buyer protection.',
  },

  {
    id: 'os-018',
    text: 'A loan app approves you for ₦20,000 in seconds without any documentation. Before you accept, what should you check first?',
    options: [
      'Whether the app logo looks professional',
      'The daily or weekly interest rate, total repayment amount, and any fees',
      'Whether friends have used it before',
      'How quickly the money arrives',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'online-safety',
    explanation:
      'Instant-approval loan apps often charge extremely high interest — some up to 30% per week. A ₦20,000 loan could require ₦26,000 or more just days later. Always calculate the total you will repay before accepting any loan.',
  },

  {
    id: 'os-019',
    text: 'What is "phishing"?',
    options: [
      'A way to catch fish using a phone app',
      'A fraud where criminals impersonate trusted organisations to steal your login details or money',
      'A type of cybersecurity attack on company servers',
      'A method banks use to verify your identity',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'online-safety',
    explanation:
      'Phishing attacks use fake messages, emails, or websites that look real — from your bank, FIRS, or even your employer — to trick you into entering your password, OTP, or card details. Always check the actual sender address and URL carefully.',
  },

  {
    id: 'os-020',
    text: 'Your BVN (Bank Verification Number) is requested by an unknown app. Should you share it?',
    options: [
      'Yes — BVN is just a public ID number',
      'No — your BVN is linked to all your bank accounts and must be shared only with verified banks or regulators',
      'Yes — if they need it to verify your identity',
      'Yes — as long as you share only the first 6 digits',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'online-safety',
    explanation:
      'Your BVN links every bank account you own. Sharing it with an unverified app or person can enable fraud across all your accounts. Only share your BVN directly with licensed Nigerian banks or CBN-regulated fintechs through official channels.',
  },

  {
    id: 'os-021',
    text: 'You see a TikTok influencer promoting a "crypto investment" with a guaranteed 200% monthly return. What should this claim tell you?',
    options: [
      'The influencer has done their research and this is safe',
      'It is almost certainly a scam — guaranteed crypto returns do not exist',
      'You should invest a small amount to test it first',
      'Crypto is always risky but this could be a rare exception',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'online-safety',
    explanation:
      'No legitimate investment offers guaranteed returns — especially not 200% monthly. Influencers promoting these schemes are often paid commissions or are themselves victims who do not realise it yet. SEC Nigeria regularly warns about influencer-promoted investment scams.',
  },

  {
    id: 'os-022',
    text: 'Which of these passwords is most secure for your banking app?',
    options: [
      'your date of birth (e.g. 15042007)',
      'your phone number',
      'A random mix of letters, numbers and symbols (e.g. Tr@58!nG2)',
      '"password123" because it is easy to remember',
    ],
    correctIndex: 2,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'online-safety',
    explanation:
      'Strong passwords use a random mix of uppercase letters, lowercase letters, numbers, and symbols. Avoid anything personal (date of birth, phone number, name) since those can be guessed or found on social media.',
  },

  // ── ADULTS / HARD ────────────────────────────────────────────────────────────

  {
    id: 'os-023',
    text: 'A loan app approved you instantly for ₦50,000 with no paperwork. Two weeks later you are struggling to repay — the app now threatens to message everyone in your phone contacts. What is the correct response?',
    options: [
      'Pay immediately by any means possible to stop the embarrassment',
      'Report the app to CBN, FCCPC, and the App Store/Play Store — contact shaming is illegal in Nigeria',
      'Ignore it and hope they stop eventually',
      'Change your phone number so they cannot reach your contacts',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'online-safety',
    explanation:
      'Contact shaming — where loan apps message your contacts without consent — violates Nigeria\'s NDPR (data protection regulation) and the FCCPC consumer protection rules. Report these apps to the CBN, FCCPC, and remove the app immediately. Many have been delisted from app stores after mass complaints.',
    consequenceReplay: {
      scenario: 'Kunle panics and borrows money from a second predatory app to repay the first.',
      outcome: 'He is now trapped in a debt spiral with two aggressive apps both demanding repayment. His contacts receive embarrassing messages regardless. Total debt doubles within a month.',
      lesson: 'Report predatory apps — do not borrow from a second trap to escape the first. Contact the CBN consumer helpline and the FCCPC.',
    },
  },

  {
    id: 'os-024',
    text: 'An investment group on Telegram promises "300% ROI in 3 weeks, backed by our proprietary crypto trading algorithm." What does this most likely describe?',
    options: [
      'A sophisticated but legitimate algorithmic trading fund',
      'A pump-and-dump or Ponzi scheme — no algorithm can guarantee such returns',
      'A high-risk but potentially rewarding DeFi protocol',
      'A forex arbitrage opportunity available only to insiders',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'online-safety',
    explanation:
      'Legitimate investment firms — even the best in the world — do not guarantee specific returns. "Proprietary algorithms" and "insider access" are classic Ponzi recruitment language. Early investors are paid with new investors\' money until the scheme collapses, leaving most people with nothing. The SEC maintains a verified list of licensed investment managers in Nigeria.',
    consequenceReplay: {
      scenario: 'Adaeze invests ₦200,000 and receives ₦50,000 "profit" after week one, so she reinvests everything.',
      outcome: 'In week three the Telegram group goes silent. Her ₦250,000 is gone. The initial ₦50,000 "profit" was her own principal returned to build trust — a tactic called the "proof of payment" hook.',
      lesson: 'Early payments are designed to make you trust and invest more. If the operator disappears, you have no legal recourse in an unregulated scheme.',
    },
  },

  {
    id: 'os-025',
    text: 'You receive a realistic-looking email from "firs.gov.ng-taxrefund.com" saying you are owed a tax refund and should click a link to claim it. What should concern you first?',
    options: [
      'That the refund amount seems too large',
      'The domain name — the real FIRS website is firs.gov.ng, not a subdomain of an unrelated site',
      'That the email was not addressed to you by name',
      'That it arrived on a weekend',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'online-safety',
    explanation:
      'Domain spoofing uses URLs that look official but are not. "firs.gov.ng-taxrefund.com" is a completely different domain from "firs.gov.ng" — the real site is everything BEFORE the first slash. Government agencies will never email you about refunds through unofficial domains. Always check the domain carefully.',
  },

  {
    id: 'os-026',
    text: 'A BNPL (Buy Now Pay Later) service offers "zero interest" for 6 months. After the 6 months, what is the most important thing to understand?',
    options: [
      'The debt disappears automatically',
      'High deferred interest may apply to the full original purchase amount if not fully paid within the promotional period',
      'The government subsidises the remaining balance',
      'You only pay interest on the remaining balance after 6 months',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'online-safety',
    explanation:
      'Many "zero interest" BNPL offers apply deferred interest — meaning if you have any balance remaining after the promotional period, they charge interest on the FULL original purchase amount from the very first day, not just the remaining balance. Always read the small print and aim to pay in full before the promotional period ends.',
  },

  {
    id: 'os-027',
    text: 'You have three subscriptions you forgot about charging your card ₦2,500 each monthly. What is the best financial action?',
    options: [
      'Leave them — ₦2,500 is not much money',
      'Audit all recurring charges, cancel unused ones, and set calendar reminders for future trials',
      'Contact your bank to block all future recurring charges',
      'Get a second card specifically for subscriptions',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'online-safety',
    explanation:
      '₦2,500 × 3 = ₦7,500/month or ₦90,000/year on services you are not using. A regular subscription audit — checking your bank statement for recurring charges — is a core personal finance habit. Apps like Cowrywise or simple spreadsheets can help track recurring payments.',
  },

  {
    id: 'os-028',
    text: 'A forex trading "mentor" on Instagram shows screenshots of massive profits and charges ₦150,000 for his "funded account" course. What is the most likely reality?',
    options: [
      'Successful traders always mentor others to build their reputation',
      'The screenshots may be fabricated, and funded account schemes often require you to lose money on a demo test to keep you paying',
      'Forex mentors are regulated by the CBN so this is legitimate',
      'A high course fee signals high quality and genuine returns',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'online-safety',
    explanation:
      'Profit screenshots are trivially easy to fake. "Funded account" courses often require students to pass a trading challenge — which most fail, triggering fees for another attempt. The course fee is the actual business model. Legitimate forex brokers are licensed by the SEC and do not recruit through Instagram DMs.',
  },

  {
    id: 'os-029',
    text: 'You receive a WhatsApp voice note from your "CEO" saying to urgently transfer ₦500,000 to a vendor account for a contract. You do not recognise the vendor. What is this?',
    options: [
      'A legitimate urgent business instruction you should execute immediately',
      'A likely Business Email/Impersonation Compromise (BEC) scam — verify through a separate channel before any transfer',
      'A test of your loyalty and efficiency as an employee',
      'Normal business practice in Nigeria for urgent payments',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'online-safety',
    explanation:
      'CEO/executive impersonation fraud (Business Email Compromise) is one of the largest sources of corporate fraud globally. AI-generated voice cloning can now replicate voices convincingly. Always verify urgent payment instructions through a separate, independently verified channel — call the CEO\'s known personal number directly, not any number they provide in the suspicious message.',
  },

  {
    id: 'os-030',
    text: 'What does it mean when a financial app requests access to your contacts, call logs, and camera in addition to the permissions needed to process a loan?',
    options: [
      'It is standard practice for financial apps to verify your identity',
      'The app is collecting data beyond what is needed — likely to use for contact shaming or data harvesting',
      'These permissions help the app offer better interest rates',
      'All regulated fintechs in Nigeria are required to collect this data',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'online-safety',
    explanation:
      'Data minimisation is a principle under Nigeria\'s NDPR — apps should only collect the data they genuinely need. A loan app needs your BVN and bank details. Requesting contacts, call logs, and camera access is a red flag that the app plans to use your data for contact shaming or selling it to third parties. Deny unnecessary permissions.',
  },

  {
    id: 'os-031',
    text: 'A mutual friend introduces you to a "private investment club" where members pool money and rotate payouts. After you join, you are told to recruit three more people to get your payout. This is:',
    options: [
      'A legitimate version of ajo (rotating savings)',
      'A pyramid scheme — your payout depends on recruiting others, not on any real investment',
      'A cooperative society registered with the government',
      'A trustworthy arrangement because a friend vouched for it',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'online-safety',
    explanation:
      'Legitimate ajo/esusu pools rotate a fixed pot among existing members. When a scheme requires you to RECRUIT new members before you receive your payout, it is a pyramid scheme — mathematically guaranteed to collapse once recruitment slows, with the last joiners losing everything. A trusted introduction does not make it legitimate.',
  },

  {
    id: 'os-032',
    text: 'Which of these behaviours most reduces your digital financial risk?',
    options: [
      'Using the same strong password across all financial apps for consistency',
      'Enabling two-factor authentication (2FA) on all financial accounts and using unique passwords per app',
      'Only using mobile banking apps on public Wi-Fi where speed is fast',
      'Storing all your PINs and passwords in your phone\'s notes app for easy access',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'online-safety',
    explanation:
      'Two-factor authentication means even if a fraudster gets your password, they cannot access your account without the second factor (usually an OTP to your registered number). Using unique passwords per app means one breach does not expose all accounts. Public Wi-Fi and storing passwords in plain notes are significant vulnerabilities.',
  },

  {
    id: 'os-033',
    text: 'A "pump-and-dump" crypto scheme works by:',
    options: [
      'Governments artificially raising crypto values to fund infrastructure',
      'Organisers buying a low-value coin, hyping it publicly to drive up the price, then selling their holdings — crashing the price and leaving others with losses',
      'Miners pumping more computing power into validating transactions',
      'Exchanges dumping unprofitable coins from their listings',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'online-safety',
    explanation:
      'Pump-and-dump schemes are common in low-cap crypto markets. Organisers accumulate a coin cheaply, then create artificial hype through social media and Telegram groups. When retail investors buy in and the price spikes, organisers sell all their holdings, the price crashes, and everyone else is left holding worthless coins.',
  },

  {
    id: 'os-034',
    text: 'A data breach at a fintech exposes your email and hashed password. What should you do first?',
    options: [
      'Wait to see if any money disappears from your account',
      'Change your password on that platform immediately, and on any other platform where you used the same password',
      'Contact the police — the fintech owes you compensation',
      'Delete the app — that removes your data from the breach',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'online-safety',
    explanation:
      'Hashed passwords can be cracked — especially weak ones. Change the breached platform\'s password immediately. If you reused that password elsewhere (email, other banking apps), change those too. Deleting the app does not remove your data from the breach — it already happened. Report to the NDPC (Nigeria Data Protection Commission) if the company fails to notify you.',
  },

  {
    id: 'os-035',
    text: 'An easy-approval digital credit app offers ₦30,000 at a "2% daily fee." How much will you owe after 30 days?',
    options: [
      '₦30,600 — it is only 2%',
      '₦48,000 — the daily fee compounds to roughly 60% over 30 days',
      '₦30,060 — the fee is tiny per day',
      '₦31,800 — a flat 6% monthly',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'online-safety',
    explanation:
      '2% per day × 30 days = 60% of the principal in fees — meaning you repay ₦48,000 for a ₦30,000 loan. Annual percentage rate (APR) at 2% daily is over 700%. Always convert any quoted rate to its monthly or annual equivalent before accepting a loan.',
  },
];

export default questions;
