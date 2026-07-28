import type { Question } from '../../types';

const questions: Question[] = [
  {
    id: 'en-001',
    text: 'What is the most important first step before starting a business in Nigeria?',
    options: [
      'Rent the most impressive office space',
      'Validate your idea by testing it with real customers before spending heavily',
      'Register a company immediately at CAC',
      'Hire 10 staff from day one',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'entrepreneur',
    explanation:
      'Validating your idea first — getting real customers to pay (even small amounts) before investing heavily — prevents wasting money on a product no one wants. Many successful Nigerian businesses started with zero office space.',
  },
  {
    id: 'en-002',
    text: 'What does CAC stand for in Nigerian business registration?',
    options: [
      'Corporate Affairs Commission',
      'Central Accounting Committee',
      'Company and Commerce Association',
      'Credit and Capital Corporation',
    ],
    correctIndex: 0,
    difficulty: 'easy',
    ageTrack: ['teens', 'adults'],
    category: 'entrepreneur',
    explanation:
      'CAC (Corporate Affairs Commission) is Nigeria\'s official body for registering businesses. You can register a business name for as little as ₦10,000–₦25,000, which legitimizes your business and enables you to open a corporate bank account.',
  },
  {
    id: 'en-003',
    text: 'Chidinma earns ₦50,000 from her catering business on a good week. Her ingredients cost ₦20,000, transport ₦3,000, packaging ₦2,000. What is her PROFIT?',
    options: ['₦50,000', '₦25,000', '₦30,000', '₦45,000'],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'entrepreneur',
    explanation:
      'Revenue ₦50,000 − Costs (₦20,000 + ₦3,000 + ₦2,000 = ₦25,000) = Profit ₦25,000. Many new entrepreneurs confuse revenue (total income) with profit (income after costs). Profit is what matters for business sustainability.',
  },
  {
    id: 'en-004',
    text: 'What is the key difference between a "business name" and a "limited liability company (Ltd)" in Nigeria?',
    options: [
      'There is no difference — they are the same',
      'A business name is cheaper to register; a Ltd company protects personal assets from business debts',
      'Only a Ltd company can hire staff',
      'A business name earns more tax exemptions',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'entrepreneur',
    explanation:
      'A business name registration (sole proprietorship) is simple and cheap but you are personally liable for business debts. A Ltd company is a separate legal entity — creditors can only go after company assets, not your personal property. This "limited liability" protection is crucial for larger businesses.',
  },
  {
    id: 'en-005',
    text: 'Which of these is a popular Nigerian government fund for small business funding?',
    options: [
      'SMEDAN / BOI (Bank of Industry) SME loans',
      'World Bank direct grants',
      'US-AID business loans',
      'European Investment Bank Nigeria',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    ageTrack: ['adults'],
    category: 'entrepreneur',
    explanation:
      'SMEDAN (Small and Medium Enterprises Development Agency of Nigeria) and BOI (Bank of Industry) offer government-backed loans and grants for Nigerian small businesses at below-market rates. The NIRSAL Microfinance Bank also provides CBN-backed loans to farmers and SMEs.',
  },
  {
    id: 'en-006',
    text: 'What is a "value proposition" for a business?',
    options: [
      'The government\'s valuation of your business for tax purposes',
      'A clear statement of why customers should choose your product over competitors',
      'The initial investment amount required to start a business',
      'Your business\'s annual profit declaration',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'entrepreneur',
    explanation:
      'Your value proposition answers: "Why should customers buy from me instead of my competitor?" It could be price, convenience, quality, speed, or a unique feature. Without a clear value proposition, marketing becomes very hard.',
  },
  {
    id: 'en-007',
    text: 'Jude sells phone accessories and earns ₦15,000 monthly from it alongside his salary. This is called:',
    options: [
      'Tax evasion',
      'A Ponzi scheme',
      'A side hustle / multiple income streams',
      'Insider trading',
    ],
    correctIndex: 2,
    difficulty: 'easy',
    ageTrack: ['teens', 'adults'],
    category: 'entrepreneur',
    explanation:
      'A side hustle is income earned outside your primary job. Multiple income streams reduce financial risk — if you lose your job, you still have income. Many Nigerians build significant wealth through side hustles that grow into main businesses.',
  },
  {
    id: 'en-008',
    text: 'What does "breakeven point" mean for a business?',
    options: [
      'When the business closes down',
      'The point at which total revenue equals total costs — the business is no longer losing money',
      'When the owner takes their first salary from the business',
      'When the business registers with CAC',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'entrepreneur',
    explanation:
      'Breakeven = when revenue covers all costs, yielding zero profit or loss. Before breakeven, every sale loses money. After breakeven, every additional sale generates profit. Knowing your breakeven point is essential for pricing and sales targets.',
  },
  // --- Kids easy questions ---
  {
    id: 'en-009',
    text: 'What is an entrepreneur?',
    options: [
      'Someone who only works for the government',
      'A person who starts their own business to earn money',
      'A person who only buys things from shops',
      'A student who studies business in school',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'entrepreneur',
    explanation: 'An entrepreneur is someone who creates their own business — selling goods, offering services, or solving problems. Entrepreneurs are job creators and important for Nigeria\'s economy.',
  },
  {
    id: 'en-010',
    text: 'Adaora buys biscuits for ₦50 per pack and sells each pack for ₦80 at school. How much profit does she make on each pack?',
    options: ['₦50', '₦80', '₦30', '₦20'],
    correctIndex: 2,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'entrepreneur',
    explanation: 'Profit = selling price − cost price. ₦80 − ₦50 = ₦30 profit per pack. This is the basic idea behind every business — sell for more than you spend to make.',
  },
  {
    id: 'en-011',
    text: 'Which of these is an example of a small business a young Nigerian could start?',
    options: [
      'Building a new motorway',
      'Selling homemade snacks or cold drinks at school',
      'Running a national airline',
      'Opening a branch of a bank',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'entrepreneur',
    explanation: 'Selling snacks, offering to wash cars, tutoring classmates, or making crafts are small businesses anyone can start with very little money. Many of Nigeria\'s biggest businesses started small.',
  },
  {
    id: 'en-012',
    text: 'What does a business need to start operating?',
    options: [
      'A government licence only',
      'A product or service, customers, and some starting money (capital)',
      'A huge office building',
      'Thousands of workers',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'entrepreneur',
    explanation: 'Every business needs something to sell (product or service), people who want to buy it (customers), and money to get started (capital). You can start very small and grow over time.',
  },
  {
    id: 'en-013',
    text: 'Biodun makes handmade bracelets that cost ₦200 to make and sells them for ₦500. If he sells 5 bracelets, what is his total profit?',
    options: ['₦1,000', '₦1,500', '₦2,500', '₦500'],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'entrepreneur',
    explanation: 'Profit per bracelet = ₦500 − ₦200 = ₦300. Total profit for 5 = ₦300 × 5 = ₦1,500. Tracking your costs and profits is the most important skill for any young entrepreneur.',
  },

  // ── NEW: Business Finance Fundamentals ───────────────────────────────────────

  // Kids / Easy — Pricing concept + money separation (conceptual only)

  {
    id: 'en-014',
    text: 'You are selling lemonade. The lemons, sugar, and cups cost ₦200. What should your selling price be?',
    options: [
      'Exactly ₦200 — so you recover your costs',
      'More than ₦200 — to cover your costs and make a profit',
      'Less than ₦200 — a lower price attracts more customers',
      'It does not matter as long as people buy it',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'entrepreneur',
    explanation:
      'Selling at exactly what things cost means you earn nothing for your effort. A business needs to charge MORE than its costs so that after paying for everything, money is left over — that leftover is your profit.',
  },

  {
    id: 'en-015',
    text: 'You earned ₦600 selling crafts at school. Your friend wants you to buy a snack with the money right now. What is the smartest thing to do?',
    options: [
      'Buy the snack — you earned the money',
      'Keep the craft money separate so you can buy more materials and keep the business going',
      'Split it equally between snacks and materials',
      'Give it to your parents for safekeeping',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'entrepreneur',
    explanation:
      'If you spend all your business money on personal things, you will have nothing left to buy more materials. Keeping business money separate — even in a separate envelope — is how small businesses survive and grow.',
  },

  {
    id: 'en-016',
    text: 'Before you decide what price to charge for something you make, what is the most important thing to find out first?',
    options: [
      'What your friends think is a fair price',
      'How much it cost you to make it',
      'What the most expensive similar thing costs anywhere',
      'How many you can make in one day',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'entrepreneur',
    explanation:
      'Your cost is the starting point for any price. If you do not know what something cost to make, you cannot know whether your price is actually making you money. Always count your costs first.',
  },

  // Teens / Medium — Separating funds, pricing for profit, basic bookkeeping, business account awareness

  {
    id: 'en-017',
    text: 'You resell phone accessories and keep all sales money mixed with your personal spending money. What is the main risk?',
    options: [
      'No risk — it is all your money either way',
      'You will not be able to see clearly whether the business is actually profitable',
      'It will make the business grow faster',
      'It has no effect on anything practical',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'entrepreneur',
    explanation:
      'When business and personal money mix, it becomes impossible to answer "did I make money this month?" You may think you are doing well because your account looks full — but that could be salary, not business profit. Separation, even just a second mobile wallet, gives you a clear picture.',
    consequenceReplay: {
      scenario: 'Amara mixes her reselling income with her personal account for six months, spending freely from both.',
      outcome: 'At the end of the year she cannot tell how much the business actually earned — or whether it earned anything at all. She has no numbers to show a supplier who could have given her a bulk discount. The business looks busy but she cannot prove it is profitable.',
      lesson: 'A clear separation — even a dedicated wallet or envelope — lets you see the business for what it really is.',
    },
  },

  {
    id: 'en-018',
    text: 'You bake chin-chin and sell it. The flour, oil, and spices cost ₦1,500. You charge ₦2,500 per bag. But you forget to count the cost of your cooking gas, the plastic bags, and the 40-minute bike ride to buy supplies. What is the likely result?',
    options: [
      'You still make a healthy profit of ₦1,000 per bag',
      'Your real profit may be much less than ₦1,000 — or even zero — once all costs are included',
      'Transport and packaging costs are too small to matter',
      'Customers will pay more automatically once they see the quality',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'entrepreneur',
    explanation:
      'Your true cost includes every input: gas, packaging, transport, even your time. Forgetting these "hidden" costs makes a price look profitable when it is not. As a rule: list every cost before setting a price, including the ones that feel small.',
    consequenceReplay: {
      scenario: 'Tobenna prices his chin-chin at ₦2,500 and sells out every weekend — he feels like a success.',
      outcome: 'After three months he adds up gas, bags, transport, and the hours he spent. His actual profit is ₦180 per bag, not ₦1,000. Working 15 hours a weekend for ₦180/bag × 20 bags = ₦3,600 — less than minimum wage. High sales volume masked a pricing problem.',
      lesson: 'High sales with an undercosted price just means you are working hard for very little. Always price for ALL your costs, not just materials.',
    },
  },

  {
    id: 'en-019',
    text: 'What is the difference between "revenue" and "profit" for a business?',
    options: [
      'They are the same thing — total money earned',
      'Revenue is total money coming in; profit is what remains after all costs are paid',
      'Profit is total money coming in; revenue is what remains after costs',
      'Revenue only counts cash sales; profit includes bank transfers',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'entrepreneur',
    explanation:
      'Revenue = every naira a business receives from customers. Profit = revenue minus ALL costs. A business can have high revenue and still lose money if costs are higher. Many entrepreneurs confuse the two and think they are doing well when they are not.',
  },

  {
    id: 'en-020',
    text: 'Why should a teen running a small side hustle write down every sale and every expense, even in a simple notebook?',
    options: [
      'Only large businesses need to track income and expenses',
      'It shows whether the business is profitable, helps set better prices, and builds the habit for when the business grows',
      'It is only useful for tax purposes, which teens do not pay',
      'It is unnecessary if you can remember everything mentally',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'entrepreneur',
    explanation:
      'Records — even one page of a notebook — answer the most important questions: Am I making money? Which product sells best? Where are my biggest costs? These answers are impossible to guess accurately from memory, and the habit of tracking becomes essential as a business grows.',
  },

  {
    id: 'en-021',
    text: 'As your small reselling business grows, why does having a separate account or mobile wallet for business money become important?',
    options: [
      'It is not important — a single account is simpler',
      'It clearly separates business income from personal income, making profits visible and tax records cleaner',
      'Banks legally require it for any income above ₦50,000',
      'It guarantees better interest rates on savings',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'entrepreneur',
    explanation:
      'A separate account makes profit instantly visible. It also builds a transaction history that is useful if you ever apply for a business loan, seek investors, or need to show a supplier your trading volume. Many Nigerian fintechs offer free business wallets — there is no cost barrier to separation.',
  },

  // Adults / Hard — Full depth: business banking, "pay myself back" trap, POS charges, bookkeeping formality

  {
    id: 'en-022',
    text: 'Your small business is growing and you are still using your personal bank account for all transactions. What is the biggest practical risk?',
    options: [
      'None — personal accounts function identically to business accounts',
      'You cannot clearly track real profit, and personal funds risk being used as business capital — or vice versa',
      'Personal accounts always offer better interest rates than business accounts',
      'It will automatically register your business with CAC',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'entrepreneur',
    explanation:
      'Mixing personal and business funds in one account creates three problems: you cannot see real profit, you risk accidentally spending business capital personally, and your transaction history does not build a business credit record. A dedicated business account (or registered corporate account) solves all three and is available from many Nigerian banks and fintechs.',
  },

  {
    id: 'en-023',
    text: 'You own a small business and regularly tell yourself "I\'ll just take ₦10,000 from the business account and pay it back later." After several months, what is the likely outcome?',
    options: [
      'The business account refills automatically from profits, so it does not matter',
      'The business becomes undercapitalised — the "pay back later" rarely happens, leaving the business short of working capital',
      'This is the standard way business owners take a salary',
      'Banks will flag the account if this happens, preventing any harm',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'entrepreneur',
    explanation:
      '"Pay myself back later" is one of the most common causes of cash flow problems for Nigerian SMEs. The money never comes back because there is always another personal need. The fix is a formal owner\'s salary or draw — a set amount paid to yourself on a schedule — so the business and personal finances are clearly separated.',
  },

  {
    id: 'en-024',
    text: 'You run a retail shop and accept POS payments. Each transaction has a 0.5% charge capped at ₦100. On a ₦5,000 sale, you net ₦4,975. If you set prices without accounting for these charges, what happens over time?',
    options: [
      'Nothing significant — ₦25 per transaction is negligible',
      'Your actual margins are lower than planned, which compounds into a meaningful cost as transaction volume grows',
      'Banks absorb POS fees automatically above a certain volume',
      'POS charges only apply to purchases above ₦10,000',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'entrepreneur',
    explanation:
      'On 200 transactions of ₦5,000 per month, ₦25 per transaction = ₦5,000/month in unplanned fees — that is ₦60,000 per year eroded from margins. Merchant fees (POS, transfer charges, gateway fees) must be factored into pricing. Many SME owners underestimate this until they run proper books.',
  },

  {
    id: 'en-025',
    text: 'You sell handmade bags. Materials cost ₦3,000 per bag, but you did not factor in the time spent making each bag or the transport cost to source materials when setting your price of ₦4,000. What is the most likely outcome?',
    options: [
      'You will still make a healthy profit of ₦1,000 per bag',
      'Your real profit margin will be significantly lower — or the price may not cover the true cost of production',
      'Time and transport are sunk costs that should never affect pricing',
      'Customers will automatically pay more once they see the quality',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'entrepreneur',
    explanation:
      'If each bag takes 3 hours and transport costs ₦500 per sourcing trip (spread across 10 bags = ₦50 per bag), your real cost is ₦3,000 + ₦50 transport + ₦X for your time. At ₦4,000, you may be earning less than minimum wage per hour. Full-cost pricing includes: materials, transport, packaging, overhead, and a fair value for your labour.',
  },

  {
    id: 'en-026',
    text: 'What does it mean to keep basic "books" for a small business?',
    options: [
      'Only companies with employees need to keep financial records',
      'Consistently recording all income and all expenses so you can see the true financial position of the business',
      'Filing monthly accounts with FIRS regardless of business size',
      'Keeping your business textbooks and learning materials organised',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'entrepreneur',
    explanation:
      'Basic bookkeeping means recording every naira that comes in and every naira that goes out — even in a simple spreadsheet or notebook app. It tells you whether you are profitable, which periods are slowest, and where costs are rising. It also becomes essential when applying for a loan or approaching an investor, both of whom will want to see records.',
  },
];

export default questions;
