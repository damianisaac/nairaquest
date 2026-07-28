import moneyBasics from './money-basics';
import banking from './banking';
import budgeting from './budgeting';
import savings from './savings';
import scams from './scams';
import taxes from './taxes';
import loans from './loans';
import economy from './economy';
import entrepreneur from './entrepreneur';
import insurance from './insurance';
import crypto from './crypto';
import pension from './pension';
import realEstate from './real-estate';
import forex from './forex';
import earning from './earning';
import creditDebit from './credit-debit';
import financialPlanning from './financial-planning';
import consumerSkills from './consumer-skills';
import riskManagement from './risk-management';
import governmentFinance from './government-finance';
import philanthropy from './philanthropy';
import buyingSelling from './buying-selling';
import profitLoss from './profit-loss';
import warranties from './warranties';
import marketing from './marketing';
import jobs from './jobs';
import timeMoney from './time-money';
import abbreviations from './abbreviations';
import onlineSafety from './online-safety';
import mindset from './mindset';
import type { Question, CategoryId } from '../../types';

export const ALL_QUESTIONS: Record<CategoryId, Question[]> = {
  'money-basics': moneyBasics,
  banking,
  budgeting,
  savings,
  scams,
  taxes,
  loans,
  economy,
  entrepreneur,
  insurance,
  crypto,
  pension,
  'real-estate': realEstate,
  forex,
  earning,
  'credit-debit': creditDebit,
  'financial-planning': financialPlanning,
  'consumer-skills': consumerSkills,
  'risk-management': riskManagement,
  'government-finance': governmentFinance,
  philanthropy,
  'buying-selling': buyingSelling,
  'profit-loss': profitLoss,
  warranties,
  marketing,
  jobs,
  'time-money': timeMoney,
  abbreviations,
  'online-safety': onlineSafety,
  mindset,
};

export function getQuestionsForSession(
  categoryId: CategoryId,
  ageTrack: 'kids' | 'teens' | 'adults',
  difficulty?: 'easy' | 'medium' | 'hard',
  count = 10
): Question[] {
  let pool = ALL_QUESTIONS[categoryId].filter((q) =>
    q.ageTrack.includes(ageTrack)
  );

  // Enforce track-appropriate difficulty caps regardless of what was passed
  const safeDifficulty =
    ageTrack === 'kids'
      ? 'easy'
      : ageTrack === 'teens' && difficulty === 'hard'
      ? 'medium'
      : difficulty;

  if (safeDifficulty) {
    pool = pool.filter((q) => q.difficulty === safeDifficulty);
  }

  return [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map(shuffleOptions);
}

/** Randomly reorder a question's options and update correctIndex to match. */
function shuffleOptions(q: Question): Question {
  const correct = q.options[q.correctIndex];
  const shuffled = [...q.options].sort(() => Math.random() - 0.5);
  return { ...q, options: shuffled, correctIndex: shuffled.indexOf(correct) };
}
