import type { Question } from '../../types';

const questions: Question[] = [
  {
    id: 'mb-001',
    text: 'You just received ₦5,000 as a birthday gift. What is the SMARTEST first step?',
    options: [
      'Spend it all on snacks and games right away',
      'Save at least 20% before spending anything',
      'Lend it to a friend who promises to double it',
      'Buy the latest trending item immediately',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids', 'teens', 'adults'],
    category: 'money-basics',
    explanation:
      'The "pay yourself first" rule means saving a portion before any spending. Even ₦1,000 (20%) saved today starts building your financial future.',
  },
  {
    id: 'mb-002',
    text: 'Which of these is the official currency of Nigeria?',
    options: ['Cedi', 'Naira', 'Shilling', 'Pound'],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids', 'teens', 'adults'],
    category: 'money-basics',
    explanation:
      'The Nigerian Naira (₦) has been Nigeria\'s official currency since 1973, replacing the pound. It is issued and regulated by the Central Bank of Nigeria (CBN).',
  },
  {
    id: 'mb-003',
    text: 'What does it mean to "save" money?',
    options: [
      'Spending money as fast as possible',
      'Giving money to strangers',
      'Setting money aside to use later',
      'Exchanging naira for dollars',
    ],
    correctIndex: 2,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'money-basics',
    explanation:
      'Saving means keeping money safe to use in the future — for emergencies, a big purchase, or a goal you are working toward.',
  },
  {
    id: 'mb-004',
    text: 'Adaeze earns ₦80,000 per month. She spends ₦75,000. How much does she save?',
    options: ['₦5,000', '₦15,000', '₦80,000', '₦0'],
    correctIndex: 0,
    difficulty: 'easy',
    ageTrack: ['kids', 'teens', 'adults'],
    category: 'money-basics',
    explanation:
      'Income minus expenses = savings. ₦80,000 − ₦75,000 = ₦5,000. Adaeze saves ₦5,000 — about 6.25% of her income. Financial experts recommend saving at least 20%.',
  },
  {
    id: 'mb-005',
    text: 'Which statement best describes a "need" versus a "want"?',
    options: [
      'A need is something fun; a want is something boring',
      'A need is essential for survival; a want is something you would like but can live without',
      'A need costs more money than a want',
      'Needs and wants are the same thing',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids', 'teens', 'adults'],
    category: 'money-basics',
    explanation:
      'Needs include food, shelter, clothing, healthcare. Wants include phones, games, fashion items. Smart financial decisions prioritize needs before wants.',
  },
  {
    id: 'mb-006',
    text: 'What is the highest naira note currently in circulation in Nigeria?',
    options: ['₦500', '₦1,000', '₦5,000', '₦200'],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'money-basics',
    explanation:
      'As of 2024, the ₦1,000 note is the highest denomination naira note in circulation. The CBN has also redesigned notes in recent years to add security features.',
  },
  {
    id: 'mb-007',
    text: 'Emeka wants to buy a ₦45,000 phone. He saves ₦3,000 every month. How many months will it take him to save enough?',
    options: ['10 months', '15 months', '20 months', '5 months'],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['kids', 'teens', 'adults'],
    category: 'money-basics',
    explanation:
      '₦45,000 ÷ ₦3,000 per month = 15 months. This shows why saving consistently and setting a timeline for goals is important.',
  },
  {
    id: 'mb-008',
    text: 'What is the symbol for the Nigerian Naira?',
    options: ['$', '€', '₦', '£'],
    correctIndex: 2,
    difficulty: 'easy',
    ageTrack: ['kids', 'teens', 'adults'],
    category: 'money-basics',
    explanation:
      'The ₦ symbol represents the Nigerian Naira. It was designed to look like the letter N with two horizontal bars through it.',
  },
  {
    id: 'mb-009',
    text: 'You have ₦2,000. A book costs ₦800 and a snack costs ₦300. If you buy both, how much is left?',
    options: ['₦800', '₦900', '₦700', '₦1,100'],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'money-basics',
    explanation:
      '₦800 + ₦300 = ₦1,100 spent. ₦2,000 − ₦1,100 = ₦900 remaining. Knowing your balance after spending is essential money management.',
  },
  {
    id: 'mb-010',
    text: 'What does "compound interest" mean in simple terms?',
    options: [
      'Interest only on the original amount you saved',
      'Earning interest on both your savings AND on interest already earned',
      'A type of fine you pay for spending too much',
      'Interest that reduces every year',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'money-basics',
    explanation:
      'Compound interest = interest on interest. If you save ₦10,000 at 10% per year, after year 1 you earn ₦1,000 interest. In year 2, you earn 10% on ₦11,000 = ₦1,100. This "snowball effect" makes early saving extremely powerful.',
  },
  {
    id: 'mb-011',
    text: 'Which of these is an example of "passive income"?',
    options: [
      'Salary from your 9-to-5 job',
      'Rent income from a property you own',
      'Money borrowed from a friend',
      'A cash gift from your parents',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'money-basics',
    explanation:
      'Passive income is money earned with little active effort — like rent, dividends, or royalties. Building passive income sources is a key step in long-term financial freedom.',
  },
  {
    id: 'mb-012',
    text: 'Bola earns ₦150,000 monthly. She uses the 50/30/20 rule. How much should she save?',
    options: ['₦30,000', '₦50,000', '₦75,000', '₦20,000'],
    correctIndex: 0,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'money-basics',
    explanation:
      'The 50/30/20 rule: 50% for needs (₦75,000), 30% for wants (₦45,000), 20% for savings/debt (₦30,000). This is one of the most popular budgeting frameworks worldwide.',
  },
  {
    id: 'mb-013',
    text: 'Which of these costs is a one-time expense vs. a recurring expense?',
    options: [
      'Monthly data subscription — one-time',
      'Buying a new school uniform — one-time',
      'Weekly transport fare — one-time',
      'Electricity bill — one-time',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids', 'teens', 'adults'],
    category: 'money-basics',
    explanation:
      'A one-time expense happens once (buying a uniform, a phone, equipment). Recurring expenses repeat regularly (data, rent, transport). Budgeting requires tracking both types separately.',
  },
  {
    id: 'mb-014',
    text: 'What does "net income" mean?',
    options: [
      'Your gross salary before any deductions',
      'Your take-home pay after taxes and deductions',
      'The income you earn from investments only',
      'Your total income from all jobs combined',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'money-basics',
    explanation:
      'Net income = gross pay minus PAYE tax, pension contributions (8%), and other statutory deductions. In Nigeria, formal employees have these deducted at source. Your budget should always be based on net (take-home) income, not gross.',
  },
  {
    id: 'mb-015',
    text: 'If you save ₦1,000 per week for a full year (52 weeks), how much have you saved?',
    options: ['₦48,000', '₦52,000', '₦50,000', '₦60,000'],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids', 'teens', 'adults'],
    category: 'money-basics',
    explanation:
      '₦1,000 × 52 weeks = ₦52,000. Consistent small savings add up significantly over time. This is the power of building a savings habit — even ₦500 per week becomes ₦26,000 a year.',
  },
  {
    id: 'mb-016',
    text: 'Which of these is the BEST description of "financial freedom"?',
    options: [
      'Having unlimited money to spend on anything',
      'Being free from any financial responsibilities',
      'Having enough passive income to cover your living expenses without needing to work',
      'Owning a business that earns millions',
    ],
    correctIndex: 2,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'money-basics',
    explanation:
      'Financial freedom means your investments, rental income, or other passive income streams cover your living expenses — so work becomes a choice, not a necessity. It\'s about cash flow, not just net worth.',
  },
  {
    id: 'mb-017',
    text: 'Tola earns ₦30,000 weekly pocket money. She saves ₦6,000 every week. What is her savings rate?',
    options: ['15%', '20%', '25%', '30%'],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids', 'teens', 'adults'],
    category: 'money-basics',
    explanation:
      '₦6,000 ÷ ₦30,000 = 0.20 = 20%. A 20% savings rate is excellent. Financial advisors recommend saving a minimum of 10–20% of income, but the higher the better when building long-term wealth.',
  },
  {
    id: 'mb-018',
    text: 'What is an "asset" versus a "liability"?',
    options: [
      'An asset costs you money; a liability earns you money',
      'An asset puts money in your pocket; a liability takes money out',
      'Assets are things you buy; liabilities are things you sell',
      'They are two words for the same thing',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'money-basics',
    explanation:
      'From Robert Kiyosaki\'s "Rich Dad Poor Dad" framework: assets generate income or appreciate (rental property, stocks, business). Liabilities cost you money over time (loans, depreciating cars, consumer debt). Building more assets than liabilities is the path to wealth.',
  },
];

export default questions;
