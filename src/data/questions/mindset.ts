import type { Question } from '../../types';

const questions: Question[] = [

  // ── KIDS / EASY ──────────────────────────────────────────────────────────────
  // Topics: delayed gratification, simple impulse control
  // Tone: entirely encouraging, no stress/anxiety framing

  {
    id: 'fw-001',
    text: 'You have ₦500 saved for a toy you really want, but you see candy at the shop today. What is the smart thing to do?',
    options: [
      'Buy the candy — you deserve a treat now',
      'Remember your toy goal and walk past the candy today',
      'Ask your parents for extra money so you can have both',
      'Give up on the toy idea and just enjoy the candy',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation:
      'Choosing your bigger goal over a small impulse feels hard in the moment, but the happiness of reaching your toy goal will last much longer than a sweet. Every time you choose your goal, you get a little better at it.',
    consequenceReplay: {
      scenario: 'Tolu buys the candy. It is gone in five minutes.',
      outcome: 'Two weeks later, when her friends show off the toy she was saving for, Tolu still does not have it — and cannot remember how she spent the ₦500.',
      lesson: 'Small pleasures pass quickly. Waiting for something bigger usually feels much better.',
    },
  },

  {
    id: 'fw-002',
    text: 'You have been saving your allowance for three weeks for a book you love. Today your friend wants to sell you his sticker collection for ₦200. What should you do?',
    options: [
      'Buy the stickers — ₦200 is not much money',
      'Think about whether stickers matter more to you than your book goal',
      'Stop saving — it is too hard with so many temptations',
      'Ask your teacher to decide for you',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation:
      'Pausing to ask "do I want this more than my goal?" is one of the most useful money habits anyone can learn. The answer might still be yes — but taking the moment to choose on purpose is what matters.',
  },

  {
    id: 'fw-003',
    text: 'Why does it sometimes feel hard to save money when you see things you want?',
    options: [
      'Because saving is impossible for children',
      'Because our brains find it easier to enjoy something right now than to wait for later',
      'Because parents never let you have real fun',
      'Because shops put the most tempting things near the entrance on purpose',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation:
      'This is not a flaw — every human brain works this way. Knowing that the "buy it now" feeling is just your brain being impatient helps you pause before acting on it. Saving gets easier with practice.',
  },

  {
    id: 'fw-004',
    text: 'You finally saved enough to buy the toy you wanted. How does reaching a goal you saved for usually feel?',
    options: [
      'Exactly the same as buying something on impulse',
      'Usually better — you worked towards it and chose it on purpose',
      'Worse — waiting was a waste of your time',
      'You probably forgot what you were saving for anyway',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation:
      'Research shows people enjoy things more when they worked or waited for them. The effort makes the reward feel real. This is why saving for something feels more satisfying than buying on impulse.',
  },

  {
    id: 'fw-005',
    text: 'Your friend spent all her pocket money on snacks in one day and now has nothing left for the week. What is the lesson?',
    options: [
      'Snacks are too expensive and she should not buy them',
      'Spending everything at once leaves nothing for later in the week',
      'She should have asked for more pocket money',
      'Her parents should manage all her money for her',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation:
      'One of the first lessons in managing money is pacing — spreading your money across the time you have, so you are not left with nothing halfway through. Even small amounts can last longer with a simple plan.',
  },

  {
    id: 'fw-006',
    text: 'The best way to save for something you really want is:',
    options: [
      'Wait until you have a lot of money before you start saving',
      'Put aside a small amount regularly, even if it is very little',
      'Ask someone else to buy it for you',
      'Only save when you feel motivated',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation:
      'Small amounts add up. Ten naira every day is ₦3,650 in a year. Starting small and staying consistent beats waiting until you feel "ready" — because that feeling rarely comes on its own.',
  },

  {
    id: 'fw-007',
    text: 'You see an advert for a new toy on TV and suddenly you really, really want it. What is a good first step before asking your parents to buy it?',
    options: [
      'Insist immediately because the feeling shows you really want it',
      'Wait a day or two to see if you still want it as much',
      'Tell all your friends about it so they can want it too',
      'Use your savings to buy it before the feeling goes away',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation:
      'The strong "I want it NOW" feeling usually fades on its own after a day or two. If you still want it just as much after waiting, it might be worth saving for. If the feeling fades, you saved yourself the money.',
  },

  {
    id: 'fw-008',
    text: 'Kemi has ₦1,000 and wants to buy a snack today (₦400) and save for a game (₦800). She cannot afford both right now. What is the wisest thing to do?',
    options: [
      'Buy the snack and forget about the game',
      'Decide which one matters more and save towards that goal',
      'Feel upset and spend all the money to feel better',
      'Borrow ₦200 from her sister to cover the gap',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation:
      'Choosing between two good things is a real money skill. Making a conscious choice — "I want the game more, so I will pass on the snack today" — feels more powerful than spending impulsively and then feeling stuck.',
  },

  {
    id: 'fw-009',
    text: 'When you feel a sudden urge to buy something you did not plan for, what is one useful thing to try?',
    options: [
      'Buy it straight away before the feeling fades',
      'Pause, take a breath, and ask yourself: do I really need this?',
      'Walk out of the shop immediately and never come back',
      'Promise yourself you will never buy anything fun again',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation:
      'A short pause is enough to break the automatic "buy it now" loop. You are not saying no forever — you are just giving your thinking brain a moment to catch up with your feeling brain.',
  },

  {
    id: 'fw-010',
    text: 'Feeling proud of yourself for saving money is:',
    options: [
      'Silly — money is not something to feel proud about',
      'A great feeling that can actually help you save even more',
      'Only for grown-ups who save big amounts',
      'Only appropriate if you saved a very large amount',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation:
      'Celebrating small wins is one of the real secrets of building any habit. When saving feels good, your brain wants to do it again. You do not need to wait for a huge milestone — noticing your progress is enough.',
  },

  // ── TEENS / MEDIUM ───────────────────────────────────────────────────────────
  // Topics: social/comparison pressure, impulse spending, healthy self-talk
  // Tone: honest, supportive, non-preachy

  {
    id: 'fw-011',
    text: 'Your friends are all buying the newest phone case and you feel left out with your old one. What is the healthiest response?',
    options: [
      'Buy it immediately, even if it stretches your budget this week',
      'Remind yourself that your worth is not tied to matching their spending',
      'Ask your parents to buy it straight away',
      'Avoid your friends until you can afford the same things they have',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'mindset',
    explanation:
      'The "left out" feeling is real and valid. But spending to match your peers is a moving target — there will always be a newer case, a newer phone, a newer outfit. Recognizing the feeling without automatically acting on it is a genuinely powerful skill.',
    consequenceReplay: {
      scenario: 'Aisha buys the phone case to fit in. She feels good for about an afternoon.',
      outcome: 'By Friday, nobody has mentioned the case. Aisha has no money left for lunch and has to borrow ₦500 from a classmate. The brief social comfort cost her a week of financial stress.',
      lesson: 'Social approval from matching others\' spending is usually short-lived. The financial pressure it creates tends to last much longer.',
    },
  },

  {
    id: 'fw-012',
    text: 'You scroll through Instagram and see a classmate posting new outfits every week. You start feeling bad about your own wardrobe. What is the most useful thing to remind yourself?',
    options: [
      'Their life is clearly better than mine and I need to catch up',
      'Social media shows highlight reels, not full financial reality — and comparison often drives unnecessary spending',
      'I should stop using social media permanently',
      'I need to work harder immediately so I can afford that lifestyle',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'mindset',
    explanation:
      'Nobody posts the bank statement alongside the outfit. Influencer and peer posts are carefully curated — some are gifted, some are financed by debt, some are borrowed. Comparing your full financial reality to someone else\'s highlight reel is a recipe for spending you will regret.',
  },

  {
    id: 'fw-013',
    text: 'You had a hard day and find yourself about to buy three snacks you do not really need just to feel better. What is this pattern called?',
    options: [
      'Impulse buying driven by emotion — sometimes called emotional spending or retail therapy',
      'A fair and sensible reward for getting through a hard day',
      'An investment in your mental health',
      'Completely normal behavior that needs no reflection at all',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'mindset',
    explanation:
      'Treating yourself occasionally is genuinely fine. The pattern worth noticing is when spending becomes your main way of coping with difficult feelings — because the relief is temporary but the money is gone. Recognizing the trigger is the first step to having more choices.',
  },

  {
    id: 'fw-014',
    text: 'You made an impulse purchase last week and now feel regret about it. What is the most useful way to respond?',
    options: [
      '"I am terrible with money and I will never change."',
      '"I made a mistake. What can I learn from it, and what is my next step?"',
      '"I will punish myself by not buying anything enjoyable for the next month."',
      '"It does not matter — money is not that important anyway."',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'mindset',
    explanation:
      'Self-criticism rarely builds better habits — it usually just makes you feel worse without changing behaviour. A simple, honest review ("what happened, what will I do differently") is far more effective. Everyone makes financial mistakes. What matters is what you do next.',
  },

  {
    id: 'fw-015',
    text: 'The "24-hour rule" for impulse purchases means:',
    options: [
      'You only have 24 hours to return a purchase after buying',
      'Waiting 24 hours before buying something unplanned, to see if you still want it',
      'You must decide within 24 hours or the price will increase',
      'Shops give you 24 hours of interest-free credit automatically',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'mindset',
    explanation:
      'The urge to buy something unplanned is usually strongest in the first few minutes. Waiting 24 hours lets the initial excitement settle. You might still want it just as much — but you will be making a calmer, more deliberate choice rather than reacting to a feeling.',
  },

  {
    id: 'fw-016',
    text: 'Your friends are planning an outing that does not fit your budget this week. What is the healthiest approach?',
    options: [
      'Go anyway and worry about the money situation later',
      'Be honest — suggest a cheaper alternative or say you will join them next time',
      'Stop spending time with friends who have more money than you',
      'Make an excuse and pretend to be ill to avoid the awkwardness',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'mindset',
    explanation:
      'Real friendships accommodate honesty. "I cannot make it this time — budget is tight, but let us do something next month" is not a weakness. It is financial self-respect. Friends who cannot accept that are telling you something important about the friendship.',
  },

  {
    id: 'fw-017',
    text: 'The label "I am just bad with money" is best understood as:',
    options: [
      'An honest, fixed truth about your personality that you should accept',
      'A harmful story that closes the door on building better habits',
      'A realistic self-assessment you should share openly with others',
      'Something only your parents or a financial advisor can change',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'mindset',
    explanation:
      'Money habits are learned behaviours, not personality traits. Nobody is born "bad with money." Every person — including the ones who seem most financially sorted — has had to learn and adjust. The story "I am bad with money" makes it feel fixed when it is not.',
  },

  {
    id: 'fw-018',
    text: 'You notice you tend to spend more money whenever you are bored or stressed. This pattern is worth noticing because:',
    options: [
      'Spending when stressed is a completely healthy coping mechanism with no downsides',
      'It means spending is managing your emotions rather than a genuine choice, which can lead to consistent overspending',
      'It proves you are a generous person who rewards yourself appropriately',
      'Everyone does this, so it does not need any reflection',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'mindset',
    explanation:
      'Using spending as an emotional outlet is not shameful — but it is useful to recognise. When you know that boredom or stress are your triggers, you can build other go-to responses: a walk, calling a friend, making tea. This gives you more choices beyond spending.',
  },

  {
    id: 'fw-019',
    text: 'You saved ₦8,000 towards a goal but spent ₦5,000 of it impulsively. Which response moves you forward most effectively?',
    options: [
      'Give up on the goal — it is ruined now',
      'Acknowledge the setback, adjust the timeline, and restart saving from ₦3,000',
      'Spend the remaining ₦3,000 too, since the goal is already derailed',
      'Keep it private and pretend the setback never happened',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'mindset',
    explanation:
      'Progress is rarely a straight line. A setback does not undo prior effort — ₦3,000 saved is still ₦3,000 more than zero. Restarting from where you are now is always better than abandoning the goal entirely.',
  },

  {
    id: 'fw-020',
    text: 'When you see an influencer living an expensive lifestyle on social media, what is important to remember?',
    options: [
      'Influencers always show their real financial lives honestly',
      'Much of what you see is curated, sponsored, or funded by brand deals — or debt',
      'You should aspire to live exactly like them as a long-term goal',
      'Social media platforms verify that influencers can afford their lifestyle',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'mindset',
    explanation:
      'The business model of social media content creation depends on appearing successful. Trips are often comped, products are gifted, and what looks like wealth is sometimes financed by brand deals or loans. Making financial decisions based on an influencer\'s curated image is comparing your reality to someone else\'s performance.',
  },

  {
    id: 'fw-021',
    text: 'A classmate bought something expensive specifically to impress people at school. Two weeks later nobody mentions it and the classmate is now broke. What does this illustrate?',
    options: [
      'Sometimes status purchases do work — people do notice for a while',
      'Spending to impress others usually creates short-lived approval at a lasting financial cost',
      'The classmate should have bought something even more impressive',
      'Keeping up appearances at school is a genuine investment in future relationships',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'mindset',
    explanation:
      'Other people\'s attention is one of the least reliable things to spend money on — it moves quickly to the next thing. The financial hole that status spending creates, however, stays behind. The people who genuinely like you do not require you to keep up appearances.',
  },

  {
    id: 'fw-022',
    text: 'One sign of a healthy relationship with money is:',
    options: [
      'Never thinking about money at all',
      'Feeling roughly in control of your spending and not dreading looking at your finances',
      'Always having more money than your peers',
      'Never making any financial mistakes whatsoever',
    ],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens', 'adults'],
    category: 'mindset',
    explanation:
      'A healthy money relationship is not about perfection or wealth — it is about feeling capable rather than overwhelmed. Most financially confident people still make mistakes, still face tight months. The difference is they do not avoid the situation or feel defined by it.',
  },

  // ── ADULTS / HARD ────────────────────────────────────────────────────────────
  // Topics: financial stress/anxiety, black tax, owambe pressure, avoidance, self-talk
  // Tone: supportive, non-judgmental — never shaming

  {
    id: 'fw-023',
    text: 'You feel pressured to contribute a large amount to a family member\'s owambe celebration that is beyond what your budget honestly allows. What is the healthiest approach?',
    options: [
      'Contribute the full expected amount to avoid family conflict',
      'Offer what your budget genuinely allows and explain your limits calmly and with care',
      'Skip the event entirely without any explanation',
      'Borrow money you cannot repay to meet the expected contribution',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation:
      'Genuine love does not require financial self-harm. Offering what you can and being honest — "I want to support you and this is what I can give right now" — is not rejection. Borrowing beyond your means to meet social expectations creates private stress that often outlasts the celebration itself.',
    consequenceReplay: {
      scenario: 'Ngozi borrows ₦60,000 she cannot afford to contribute the "expected" amount to a cousin\'s party.',
      outcome: 'The party is a wonderful success. Three months later, Ngozi is still quietly paying off the loan and is too stressed to enjoy her own social events. Nobody at the celebration knew what it cost her privately.',
      lesson: 'Contributions made from debt do not strengthen relationships — they silently strain yours. Honest limits, offered with warmth, are more sustainable than silent sacrifice.',
    },
  },

  {
    id: 'fw-024',
    text: 'You have been avoiding checking your bank balance for two weeks because seeing it makes you anxious. What is the most helpful first step?',
    options: [
      'Keep avoiding it — the stress means you are not ready to face it yet',
      'Set a specific, low-pressure time to look at it — perhaps with a cup of tea and fifteen minutes of calm',
      'Spend on something enjoyable to distract yourself from the anxiety first',
      'Ask someone else to manage your finances so you never have to look',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation:
      'Financial anxiety often makes the idea of looking feel worse than the reality actually is. What you imagine the balance might be is frequently scarier than what you actually find. A short, scheduled check — done calmly rather than in a moment of panic — almost always feels manageable once started.',
    consequenceReplay: {
      scenario: 'Bola avoids his bank app for three more weeks.',
      outcome: 'What was a ₦12,000 overdraft has now accumulated ₦3,500 in charges and a missed standing order. A ten-minute review three weeks earlier would have caught it. The number that felt too scary to look at became larger precisely because it was not looked at.',
      lesson: 'Avoidance does not pause financial problems — it often lets them grow quietly in the background. Most things look more manageable once seen clearly.',
    },
  },

  {
    id: 'fw-025',
    text: '"Black tax" describes the financial pressure many Nigerians experience to:',
    options: [
      'Pay a hidden government surcharge on business income',
      'Financially support extended family members, often at significant personal cost',
      'Avoid paying formal income tax by underreporting',
      'Send money remittances to relatives living abroad',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation:
      'Black tax is a real and meaningful financial reality for many Nigerians. Acknowledging it is not complaining — it is recognising a genuine pressure on personal finances. Managing it sustainably often requires honest conversations with family about what you can genuinely afford, rather than quietly overstretching every month.',
  },

  {
    id: 'fw-026',
    text: 'A sibling calls regularly asking for financial support that you genuinely cannot give without going into debt yourself. What is the healthiest long-term approach?',
    options: [
      'Send money every time to avoid conflict and preserve the relationship at all costs',
      'Have an honest, caring conversation about what you can realistically sustain long-term',
      'Cut off contact entirely to protect your own finances',
      'Borrow from others indefinitely to keep sending the money',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation:
      'Saying "I love you and I cannot continue at this level without hurting myself financially" is not abandoning family — it is an honest act of care for both of you. Unsustainable giving usually leads to eventual resentment or financial crisis. A genuine conversation protects the relationship more than silent self-sacrifice does.',
  },

  {
    id: 'fw-027',
    text: 'You are under significant financial stress — bills are piling up, you are not sleeping well, and you feel ashamed to tell anyone. What is the most important thing to do?',
    options: [
      'Maintain appearances — nobody else needs to know about your financial situation',
      'Talk to at least one person you trust, whether a friend, family member, or financial counsellor',
      'Spend on something enjoyable to give yourself a temporary lift',
      'Wait for the situation to resolve itself before taking any action',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation:
      'Financial shame is one of the most isolating feelings there is — and one of the most common. Most people struggle at some point. Talking to someone does not fix the numbers immediately, but it almost always makes the situation feel less overwhelming and often opens up options you could not see alone.',
  },

  {
    id: 'fw-028',
    text: 'Financial avoidance — ignoring bills, not opening bank statements, skipping budgeting entirely — typically results in:',
    options: [
      'Useful mental space to recover emotionally before addressing problems',
      'Small problems growing larger and your options narrowing over time',
      'A recommended approach for people who genuinely find finances very stressful',
      'No real harm as long as you eventually address things',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation:
      'The instinct to avoid something stressful is completely human. The challenge is that financial problems do not pause while you are avoiding them — interest accumulates, deadlines pass, options close. The same problem that feels overwhelming today will likely feel more overwhelming in three months if left alone.',
  },

  {
    id: 'fw-029',
    text: 'You made a serious financial mistake — a bad investment that cost you significantly. What is the most productive mindset going forward?',
    options: [
      '"I am financially foolish — I should stop making any financial decisions."',
      '"This was a costly mistake. What did I learn, and what is one step I can take now?"',
      '"I need to take a bigger risk quickly to win the money back."',
      '"Money causes too much stress — I will stop paying close attention to it."',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation:
      'A financial setback is painful. It is not proof of permanent incapacity. Every financially experienced person has made costly mistakes — the difference is they used them as information rather than identity. Asking "what did I learn?" converts the loss into something that can genuinely protect you going forward.',
  },

  {
    id: 'fw-030',
    text: 'Your colleagues discuss their salaries and you feel yours is embarrassingly low by comparison. What is the healthiest response to that feeling?',
    options: [
      'Take out a loan immediately to fund a lifestyle that matches theirs outwardly',
      'Acknowledge the feeling, then focus on what you can influence — your skills, earning potential, and spending plan',
      'Avoid all future conversations involving money with colleagues',
      'Accept that you are underperforming financially and lower your own expectations',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation:
      'Comparison is natural. Acting on it by borrowing or overspending to appear equal is not. The colleague with a higher salary may also have higher expenses, more debt, or different family obligations. What you can genuinely influence is your own plan — earning more over time, spending intentionally, building gradually.',
  },

  {
    id: 'fw-031',
    text: 'You have been disciplined with your budget for two solid months, then overspend significantly in the third week. Which mindset serves you best?',
    options: [
      '"Two months of good work is now completely ruined. I have failed."',
      '"Consistency over time matters more than any single week — I will reset and continue."',
      '"I need an even stricter budget next month to punish myself for this."',
      '"Budgeting clearly does not work for me, so I should abandon it entirely."',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation:
      'Two months of consistent effort is real. One difficult week does not erase it. Treating a setback as total failure usually leads to complete abandonment of the habit. Treating it as one data point — "what triggered this, what will I adjust?" — keeps the long-term progress intact.',
  },

  {
    id: 'fw-032',
    text: 'When financial stress begins affecting your sleep, your relationships, or your concentration at work, what is the most accurate way to understand what is happening?',
    options: [
      'You are overreacting — financial problems are not serious enough to affect your wellbeing',
      'Financial wellbeing and mental wellbeing are genuinely connected, and taking both seriously is appropriate',
      'This is rare and unusual — most people experience no emotional impact from money stress',
      'The solution is purely financial — resolve the numbers and the emotional impact will immediately disappear',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation:
      'Financial stress is one of the most consistent predictors of broader wellbeing challenges. This is not weakness — it is how humans are wired. Addressing both the practical financial situation and the emotional response to it (through support, rest, planning) is more effective than trying to manage just one side.',
  },

  {
    id: 'fw-033',
    text: 'Replacing "I am bad with money" with "I am still building better money habits" is an example of:',
    options: [
      'Unhelpful positive thinking that ignores real financial problems',
      'A more accurate and constructive framing that keeps the door to change open',
      'Self-deception that prevents honest self-assessment',
      'A phrase that only makes sense if you have already improved significantly',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation:
      'Language shapes what we believe is possible. "I am bad with money" is a fixed label — it implies nothing can change. "I am building better habits" is accurate and open — it acknowledges the present while leaving room for growth. Both describe the same situation. Only one of them helps you move forward.',
  },

  {
    id: 'fw-034',
    text: 'Which of these describes a sustainable, long-term approach to managing your relationship with money?',
    options: [
      'Checking your finances only when absolutely necessary to avoid triggering stress',
      'A regular, calm money review — weekly or monthly — that becomes a normal part of your routine rather than a crisis response',
      'Delegating all financial decisions to a partner or family member so you do not have to engage with it',
      'Only thinking about money when you have a comfortable surplus to review',
    ],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation:
      'Financial confidence is built through regular, low-stakes engagement — not through occasional crisis reviews. When looking at your finances becomes a normal, unremarkable habit rather than something you only do when forced, it loses much of its power to trigger anxiety.',
  },
];

export default questions;
