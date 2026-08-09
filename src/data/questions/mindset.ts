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
  // ── Kids Easy (rotation variety) ─────────────────────────────────────────
  {
    id: 'fw-035',
    text: 'Adaeze really wants to buy a new toy but her mum says they should save the money instead. Adaeze feels upset. What is the BEST thing for her to do?',
    options: [
      'Cry until her mum changes her mind',
      'Understand that waiting and saving is sometimes wiser than spending now',
      'Ask a neighbour to buy it for her',
      'Take the money without telling her mum',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'It is normal to feel disappointed when you cannot have something you want. But learning to wait and save — called "delayed gratification" — is one of the most powerful money habits you can build from a young age.',
  },
  {
    id: 'fw-036',
    text: 'Your classmate got new shoes and now everyone is talking about them. You feel like you NEED new shoes too even though yours are still good. What is this feeling called?',
    options: [
      'A real need',
      'Peer pressure and social spending — wanting things because others have them, not because you actually need them',
      'Financial planning',
      'Smart shopping',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'Wanting things because others have them is called peer pressure or social spending. It is one of the biggest traps for money. Before spending, always ask: "Do I actually need this, or do I just want it because someone else has it?"',
  },
  {
    id: 'fw-037',
    text: 'Emeka made a bad investment — he spent his savings on something that turned out to be worthless. What is the BEST response to this mistake?',
    options: [
      'Give up on managing money — it is too hard',
      'Learn from what went wrong and make better decisions next time',
      'Never tell anyone about the mistake',
      'Blame everyone else for the bad decision',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'Everyone makes financial mistakes — even adults. The key is to learn from them. What went wrong? Why? What would you do differently? A growth mindset turns mistakes into lessons.',
  },
  {
    id: 'fw-038',
    text: 'Tunde worries every day that his family does not have enough money. This constant worry about money is called:',
    options: [
      'Budgeting',
      'Financial stress — it affects health, focus, and relationships',
      'Investment planning',
      'Smart saving',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'Financial stress is real — it affects how well you sleep, how you concentrate at school, and how you treat people around you. Building good money habits (saving, budgeting) reduces financial stress by giving you more control over your money.',
  },
  {
    id: 'fw-039',
    text: 'What does "being grateful for what you have" have to do with managing money?',
    options: [
      'Nothing — gratitude and money are unrelated',
      'It helps reduce the urge to spend money on things you do not need just to feel better or impress others',
      'It means you should never buy anything new',
      'Grateful people automatically become rich',
    ],
    correctIndex: 1,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'Contentment — being happy with what you have — reduces impulsive spending. Many people spend money to chase a feeling (status, happiness, belonging). Gratitude helps you recognise what you already have, so you spend less on things you don\'t really need.',
  },

  {
    id: 'fw-040',
    text: 'If you don\'t get something you want right away, how can you feel about it?',
    options: ['Okay, because waiting can help you reach a bigger goal', 'Always terrible with no way to feel better', 'Angry at everyone around you', 'It\'s impossible to feel okay about waiting'],
    correctIndex: 0,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'Not getting something right away is a normal part of saving — redirecting disappointment into motivation to keep saving builds emotional resilience.',
  },
  {
    id: 'fw-041',
    text: 'Why might it help to take a breath before buying something you suddenly want?',
    options: ['It gives you a moment to think if you really want it', 'Breathing has no connection to buying decisions', 'You should never think before buying anything', 'Sudden wants are always worth buying immediately'],
    correctIndex: 0,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'A brief pause before any impulsive purchase gives your thinking brain time to evaluate whether it\'s a genuine want or a passing impulse.',
  },
  {
    id: 'fw-042',
    text: 'If a friend has a toy you don\'t have, how can you feel good about your own things?',
    options: ['Remember and appreciate what you already have', 'Feel bad about yourself constantly', 'Demand your friend gives you their toy', 'Ignore your own feelings completely'],
    correctIndex: 0,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'Gratitude for what you already have is a healthier emotional response to comparison than envy — it refocuses attention from scarcity to abundance.',
  },
  {
    id: 'fw-043',
    text: 'Why might saying \'maybe next time\' to yourself about a purchase be a healthy habit?',
    options: ['It helps you practice patience instead of buying everything immediately', 'This phrase has no real value', 'You should never say this to yourself', 'Patience with purchases has no benefit'],
    correctIndex: 0,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'Saying \'maybe next time\' to yourself practises the delay of gratification that is fundamental to building savings over time.',
  },
  {
    id: 'fw-044',
    text: 'What\'s a kind thing to say to yourself if you make a spending mistake, like spending your savings too fast?',
    options: ['It\'s okay, I can learn from this and do better next time', 'I\'m terrible with money and always will be', 'I should never be trusted with money again', 'There\'s no way to feel okay about a mistake'],
    correctIndex: 0,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'A spending mistake is a learning opportunity — self-compassion plus a specific lesson (\'I\'ll plan better next time\') is more useful than guilt.',
  },
  {
    id: 'fw-045',
    text: 'Why might comparing what you have to what your friends have sometimes make you feel unhappy?',
    options: ['Comparison can create feelings of not having enough, even when you actually do', 'Comparing yourself to friends always makes you feel great', 'Comparison has no connection to feelings at all', 'You should always compare yourself to others constantly'],
    correctIndex: 0,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'Comparing your possessions to others\' creates an ever-moving target — focusing on your own progress is more motivating and accurate.',
  },
  {
    id: 'fw-046',
    text: 'What\'s a healthy way to feel proud about your savings progress?',
    options: ['Celebrating your progress, even if it\'s small steps', 'Only feeling proud if you have a huge amount saved', 'Never feeling proud about your savings at all', 'Proud feelings have no connection to saving money'],
    correctIndex: 0,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'Celebrating small progress validates the effort and keeps motivation alive — dismissing small wins leads to feeling like progress is never enough.',
  },
  {
    id: 'fw-047',
    text: 'Why might it help to talk to a trusted adult if you feel confused or worried about money?',
    options: ['Trusted adults can help explain things and ease your worries', 'Talking about money worries never actually helps', 'You should never discuss money feelings with anyone', 'Worries about money should always be kept completely secret'],
    correctIndex: 0,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'Talking to a trusted adult when money feels confusing or worrying reduces anxiety and builds the adult-guided financial literacy needed to grow.',
  },
  {
    id: 'fw-048',
    text: 'What\'s a positive way to think about saving money slowly over time?',
    options: ['Each small step gets you closer to your goal', 'Slow saving means you\'ll never reach your goal', 'There\'s no positive way to think about slow saving', 'Saving slowly is always a bad approach'],
    correctIndex: 0,
    difficulty: 'easy',
    ageTrack: ['kids'],
    category: 'mindset',
    explanation: 'Each small saving, however modest, is a step forward — framing progress as accumulation rather than gap from the goal sustains motivation.',
  },
  {
    id: 'fw-049',
    text: 'Why might impulse spending sometimes be connected to how you\'re feeling emotionally, not just what you actually need?',
    options: ['Emotions have no real connection to spending behavior', 'Stress, boredom, or excitement can sometimes drive spending decisions that aren\'t purely about genuine need', 'Impulse spending is always a purely logical decision with no emotional factor', 'Feelings never play any role in how people spend money'],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens'],
    category: 'mindset',
    explanation: 'Emotional states like stress, boredom, or excitement trigger impulse spending — recognising the connection helps you pause before spending emotionally rather than intentionally.',
  },
  {
    id: 'fw-050',
    text: 'What\'s a healthier way to respond to feeling anxious about money than avoiding thinking about it entirely?',
    options: ['Take small, manageable steps to understand and address the situation calmly', 'Avoidance is always the best way to handle money anxiety', 'Anxiety about money should always be ignored completely', 'There\'s no healthy way to respond to money-related stress'],
    correctIndex: 0,
    difficulty: 'medium',
    ageTrack: ['teens'],
    category: 'mindset',
    explanation: 'Gently acknowledging a money problem and taking one small step toward understanding it is far more productive than avoidance, which allows problems to compound.',
  },
  {
    id: 'fw-051',
    text: 'Why might replacing the thought \'I\'m just bad with money\' with something more constructive matter for building better habits?',
    options: ['Self-critical thoughts have no real effect on future financial behavior', 'Constructive self-talk can support motivation and learning, while harsh self-judgment can discourage effort and improvement', 'Harsh self-talk always leads to better financial discipline', 'Self-talk has no connection to financial habits at all'],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens'],
    category: 'mindset',
    explanation: 'Fixed money mindsets (\'I\'m bad with money\') are self-defeating — framing financial skills as learnable redirects energy from self-blame to practical improvement.',
  },
  {
    id: 'fw-052',
    text: 'What\'s a reasonable response to feeling pressure to spend money to fit in with a social group?',
    options: ['Always spend beyond your means to avoid feeling left out', 'Recognize the pressure and make a decision aligned with your own values and budget, even if it feels uncomfortable', 'Pressure to spend should always be immediately obeyed', 'There\'s no way to navigate social spending pressure healthily'],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens'],
    category: 'mindset',
    explanation: 'Social spending pressure is real but your financial situation is personal — making spending decisions based on your values and budget, not peer behaviour, is the healthier path.',
  },
  {
    id: 'fw-053',
    text: 'Why might practicing a brief pause before an impulse purchase help build healthier spending habits over time?',
    options: ['A pause has no real effect on spending habits', 'It creates space to check whether the purchase is a genuine want aligned with your goals, rather than a reactive impulse', 'Impulse purchases are always the better choice with no need for reflection', 'Pausing before spending makes decisions worse, not better'],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens'],
    category: 'mindset',
    explanation: 'A brief pause (minutes, hours, or a day) before an impulse purchase consistently reduces the rate of regretted purchases — the pause is the habit worth building.',
  },
  {
    id: 'fw-054',
    text: 'What\'s a healthy way to celebrate reaching a savings goal without immediately spending it all on something unplanned?',
    options: ['Acknowledge the achievement meaningfully while still keeping your broader financial goals in mind', 'Celebrating a goal always requires spending the entire amount immediately', 'There\'s no healthy way to celebrate a financial achievement', 'Achievements should never be acknowledged in any way'],
    correctIndex: 0,
    difficulty: 'medium',
    ageTrack: ['teens'],
    category: 'mindset',
    explanation: 'Acknowledging a savings achievement is motivating and healthy — immediately spending the saved amount on an unrelated purchase defeats the goal and removes the reward signal.',
  },
  {
    id: 'fw-055',
    text: 'Why might comparing your finances to heavily curated social media posts from peers create an unrealistic picture?',
    options: ['Social media often shows a selective, idealized version of someone\'s life, not the full financial reality', 'Social media always accurately reflects someone\'s true financial situation', 'Comparison to social media has no real effect on how people feel about money', 'Curated posts never influence anyone\'s feelings about their own finances'],
    correctIndex: 0,
    difficulty: 'medium',
    ageTrack: ['teens'],
    category: 'mindset',
    explanation: 'Social media financial comparison is almost always distorted — curated images of spending don\'t reflect underlying debt, family support, or financial strain.',
  },
  {
    id: 'fw-056',
    text: 'What\'s a sound way to handle a spending mistake, like overspending your allowance one month?',
    options: ['Reflect on it constructively and adjust your approach going forward, rather than dwelling in harsh self-criticism', 'Mistakes should always lead to giving up on budgeting entirely', 'Harsh self-criticism is the best way to respond to a spending mistake', 'There\'s no constructive way to respond to a spending mistake'],
    correctIndex: 0,
    difficulty: 'medium',
    ageTrack: ['teens'],
    category: 'mindset',
    explanation: 'Treating an overspend as data rather than failure — noting what triggered it and how to adjust — is the constructive approach that improves future behaviour.',
  },
  {
    id: 'fw-057',
    text: 'Why might building an awareness of your own emotional triggers around spending be a valuable long-term skill?',
    options: ['Emotional triggers have no real connection to spending behavior', 'Recognizing what emotions or situations lead you to spend impulsively can help you develop healthier, more intentional habits over time', 'This awareness only matters for people with serious financial problems', 'Emotional awareness has no practical application to money management'],
    correctIndex: 1,
    difficulty: 'medium',
    ageTrack: ['teens'],
    category: 'mindset',
    explanation: 'Recognising your own emotional triggers around spending allows you to create strategies (waiting periods, shopping rules) that interrupt the pattern before money is spent.',
  },
  {
    id: 'fw-058',
    text: 'You notice you\'ve been avoiding checking your bank balance because it stresses you out. What\'s the healthiest first step?',
    options: ['Keep avoiding it until the stress goes away', 'Set a specific, low-pressure time to review it calmly', 'Spend more to distract yourself', 'Ask someone else to never mention money again'],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation: 'Avoidance increases financial anxiety over time — a scheduled, calm review session with defined scope transforms an overwhelming task into a manageable routine.',
  },
  {
    id: 'fw-059',
    text: 'Why might replacing shame-based self-talk about money (\'I\'m terrible with money\') with constructive framing support better long-term financial behavior?',
    options: ['Self-talk has no real bearing on financial behavior', 'Shame can discourage engagement with finances altogether, while constructive framing can support consistent, motivated effort toward improvement', 'Shame-based self-talk is always the most effective motivator for financial change', 'Constructive self-talk has no practical benefit for financial habits'],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation: 'Shame disconnects people from their finances — replacing shame with curiosity (\'what\'s actually happening here?\') enables engagement that leads to actual improvement.',
  },
  {
    id: 'fw-060',
    text: 'What\'s a healthy response to persistent pressure to financially support extended family beyond what feels sustainable?',
    options: ['Always comply fully regardless of your own financial sustainability, with no boundary-setting', 'Communicate a clear, respectful boundary based on what you can genuinely sustain, while still honoring your values around support', 'Refuse all family financial requests entirely with no discussion', 'There\'s no way to navigate this kind of pressure in a healthy way'],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation: 'Communicating real financial limits clearly and respectfully — rather than silently complying and resenting it — is both healthier for you and fairer to the person asking.',
  },
  {
    id: 'fw-061',
    text: 'Why might recognizing \'owambe pressure\' (spending to keep up appearances at social events) as a specific pattern help someone respond to it more intentionally?',
    options: ['Naming the pattern has no real value in addressing it', 'Recognizing the pattern helps separate genuine values from social pressure, supporting more intentional financial decisions', 'Owambe-related spending pressure doesn\'t actually exist as a real pattern', 'This kind of social pressure should always be fully accommodated regardless of personal financial impact'],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation: 'Recognising owambe and social event pressure as a spending pattern — separate from genuine generosity — allows you to set spending limits that honour both values and budget.',
  },
  {
    id: 'fw-062',
    text: 'What\'s a sound approach to managing financial stress that\'s affecting sleep or mood, beyond just trying to ignore it?',
    options: ['Taking manageable steps, like reviewing finances calmly or talking to someone, tends to be more constructive than avoidance', 'Avoidance is always the most effective long-term strategy for financial stress', 'Financial stress should never be addressed directly under any circumstances', 'There\'s no connection between financial stress and overall wellbeing'],
    correctIndex: 0,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation: 'Taking action, however small, produces a sense of agency that reduces anxiety — avoidance maintains and deepens both the problem and the distress.',
  },
  {
    id: 'fw-063',
    text: 'Why might building small, consistent money habits tend to be more sustainable than pursuing financial \'perfection\'?',
    options: ['Perfectionism can lead to discouragement or abandonment when inevitable setbacks occur, while small consistent habits tend to be more sustainable over time', 'Financial perfection is always achievable with enough effort and should always be the goal', 'Consistency has no real advantage over pursuing an idealized, flawless approach', 'Small habits have no meaningful long-term impact compared to major changes'],
    correctIndex: 0,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation: 'Perfectionism sets an impossibly high standard that makes every small setback feel like total failure — small, consistent habits sustain progress through inevitable imperfect days.',
  },
  {
    id: 'fw-064',
    text: 'What\'s a healthy way to process regret after a financial decision that didn\'t work out as hoped?',
    options: ['Reflect on it constructively to inform better future decisions, rather than dwelling in prolonged self-blame', 'Regret should always lead to giving up on financial planning entirely', 'Prolonged self-blame is the most effective way to process a financial setback', 'There\'s no constructive way to process financial regret'],
    correctIndex: 0,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation: 'Constructive reflection on a financial mistake identifies what to change — prolonged self-blame consumes energy that could be directed at those changes.',
  },
  {
    id: 'fw-065',
    text: 'Why might comparing your financial situation to others\' visible spending or lifestyle create a distorted sense of your own progress?',
    options: ['Visible spending or lifestyle often doesn\'t reflect someone\'s full financial picture, including any debt or strain behind it', 'Visible spending always accurately reflects someone\'s complete financial health', 'Comparison to others has no real effect on how people perceive their own financial progress', 'This kind of comparison always leads to more accurate self-assessment'],
    correctIndex: 0,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation: 'Visible spending and lifestyle rarely reveal the full financial picture — someone who appears wealthy may carry significant debt or receive family support you\'re not aware of.',
  },
  {
    id: 'fw-066',
    text: 'What\'s a reasonable way to approach a difficult conversation about finances with a partner or family member?',
    options: ['Avoiding the conversation entirely is always the healthiest approach', 'Approaching it with openness and a focus on shared understanding, rather than blame, tends to support more constructive outcomes', 'Difficult financial conversations should always be approached with blame and confrontation', 'There\'s no constructive way to have financial conversations with loved ones'],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation: 'Approaching financial discussions with curiosity and shared problem-solving framing reduces defensiveness and produces more productive conversations and outcomes.',
  },
  {
    id: 'fw-067',
    text: 'Why might building genuine financial confidence over time involve both practical knowledge and a healthier emotional relationship with money?',
    options: ['Emotional wellbeing has no real connection to practical financial competence', 'Financial wellbeing tends to involve both the practical skills and a healthier mindset around money, rather than either alone', 'Practical financial knowledge alone is always sufficient for genuine financial confidence', 'Emotional relationship with money has no bearing on financial outcomes'],
    correctIndex: 1,
    difficulty: 'hard',
    ageTrack: ['adults'],
    category: 'mindset',
    explanation: 'Financial wellbeing integrates practical skills (budgeting, investing) with a healthy emotional relationship with money — neglecting either dimension limits long-term financial health.',
  },
];

export default questions;
