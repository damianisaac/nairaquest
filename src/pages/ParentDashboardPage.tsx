import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectMasteryPercent } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';
import {
  isSupabaseConfigured,
  fetchLinkedChildren,
  fetchChildProgress,
  linkChildAccount,
  type DbProfile,
  type DbCategoryProgress,
} from '../lib/supabase';
import { CATEGORIES } from '../data/categories';
import TopNav from '../components/ui/TopNav';
import MasteryBar from '../components/ui/MasteryBar';
import { sound } from '../components/ui/SoundController';
import type { CategoryId } from '../types';

// Activity suggestions keyed by weak category
const ACTIVITY_TIPS: Record<CategoryId, string[]> = {
  'money-basics': [
    'Give your child ₦500 and ask them to plan how to spend it over a week.',
    'Play "market stall" at home: set prices for toys, let them pay and get change.',
    'Open a piggy bank together and count savings weekly.',
  ],
  banking: [
    'Show your child your mobile banking app — explain what each section does.',
    'Walk them through an ATM withdrawal and explain the PIN safety rules.',
    'Use *737# together to check balance and explain USSD banking.',
  ],
  budgeting: [
    'Give them a small weekly allowance and help them divide it: needs, wants, savings.',
    'Let them help write the household grocery budget for a week.',
    'Create a savings jar system: label jars "Spend", "Save", "Give".',
  ],
  savings: [
    'Open a children\'s savings account together at a bank.',
    'Explain your family\'s "ajo" or savings group to them.',
    'Show how compound interest works using a simple calculator.',
  ],
  scams: [
    'Practice "what would you do?" scenarios — "Someone texts you asking for your PIN…".',
    'Show them a real phishing email (safely) and explain the red flags.',
    'Discuss one real Nigerian fraud case from the news as a family.',
  ],
  loans: [
    'Explain what a bank loan is using a simple real-world example.',
    'Discuss the difference between borrowing from a friend vs. a bank.',
    'If old enough, show them a real loan repayment schedule.',
  ],
  economy: [
    'Point out price changes at the market and discuss why prices rise.',
    'Show them today\'s dollar-to-naira rate and explain exchange rates simply.',
    'Watch a 5-minute CBN explainer video together.',
  ],
  entrepreneur: [
    'Help them sell something small — handmade items, cold water, snacks — and track profit.',
    'Discuss a local business you admire and how it started.',
    'Encourage them to solve a problem at home for "payment" (chores for reward).',
  ],
  insurance: [
    'Explain why your family has (or should have) health insurance.',
    'Discuss what would happen if something expensive broke without protection.',
    'Look at the NHIS card together and explain what it covers.',
  ],
  taxes: [
    'Show your child a simple tax calculation: if you earn ₦100 and pay 7.5% VAT, how much do you pay?',
    'Explain why taxes pay for roads, schools, and hospitals they use.',
    'Look up your family\'s TIN together and explain what it is.',
  ],
  crypto: [
    'Explain what Bitcoin is using the analogy of a digital collectible with limited supply.',
    'Discuss a news story about a crypto scam and what the red flags were.',
    'Show them the eNaira app or website and explain how a CBDC differs from crypto.',
  ],
  pension: [
    'Explain that working parents save for retirement — show your RSA statement together.',
    'Use a compound interest calculator to show what ₦5,000/month becomes over 30 years.',
    'Ask: "What do you want your life to look like at age 65?" — connect it to saving now.',
  ],
  'real-estate': [
    'Drive past a new building and discuss what documents the owner needs.',
    'Look up what a "C of O" is and why it matters before buying land in Nigeria.',
    'Discuss a real estate scam story from the news and what due diligence was missing.',
  ],
  forex: [
    'Check today\'s exchange rate together and discuss why it changes.',
    'Show them the cost of an international product in naira vs. dollars.',
    'Explain how remittances work if you have family abroad who sends money home.',
  ],
};

interface ChildData {
  profile: DbProfile;
  progress: DbCategoryProgress[];
}

export default function ParentDashboardPage() {
  const navigate = useNavigate();
  const state = useGameStore();
  const { user } = useAuth();
  const { profile } = state;

  const [children, setChildren] = useState<ChildData[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [linkId, setLinkId] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'mastery' | 'tips'>('mastery');

  const isCloud = isSupabaseConfigured && !!user;

  useEffect(() => {
    if (!isCloud || !user) { setLoading(false); return; }
    fetchLinkedChildren(user.id).then(({ data }) => {
      if (data && data.length > 0) {
        Promise.all(
          data.map(async (link) => {
            const { data: progress } = await fetchChildProgress(link.child_id);
            return { profile: link.profiles as DbProfile, progress: progress ?? [] };
          })
        ).then((results) => {
          setChildren(results);
          if (results.length > 0) setSelectedChild(results[0]);
        });
      }
      setLoading(false);
    });
  }, [isCloud, user]);

  const handleLink = async () => {
    if (!linkId.trim() || !user) return;
    setLinking(true);
    setLinkError(null);
    const { error } = await linkChildAccount(user.id, linkId.trim());
    if (error) { setLinkError('Could not find that account. Check the ID and try again.'); }
    else {
      setLinkId('');
      // Reload
      const { data } = await fetchLinkedChildren(user.id);
      if (data) {
        const results = await Promise.all(
          data.map(async (link) => {
            const { data: progress } = await fetchChildProgress(link.child_id);
            return { profile: link.profiles as DbProfile, progress: progress ?? [] };
          })
        );
        setChildren(results);
        if (results.length > 0 && !selectedChild) setSelectedChild(results[0]);
      }
    }
    setLinking(false);
  };

  if (!profile) { navigate('/'); return null; }

  // Weak zones = mastery < 50%, from local store for the current user (kid mode)
  const localWeakZones = CATEGORIES.filter((cat) => selectMasteryPercent(state, cat.id) < 0.5);
  const selectedWeakZones = selectedChild
    ? CATEGORIES.filter((cat) => {
        const p = selectedChild.progress.find((p) => p.category_id === cat.id);
        return !p || p.mastery_points / 1000 < 0.5;
      })
    : localWeakZones;

  return (
    <div className="min-h-screen bg-gray-950 ankara-bg">
      <TopNav />
      <main className="pt-20 pb-12 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-5xl mb-3">👨‍👩‍👧</div>
          <h1 className="font-display text-3xl text-white">Parent Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">Track your child's financial literacy journey</p>
        </motion.div>

        {/* Cloud: child selector + link */}
        {isCloud ? (
          <>
            {loading ? (
              <div className="flex justify-center py-10">
                <span className="w-6 h-6 border-2 border-white/20 border-t-naira-green rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Linked children */}
                {children.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
                    {children.map((child) => (
                      <button
                        key={child.profile.id}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                          selectedChild?.profile.id === child.profile.id
                            ? 'border-naira-green bg-naira-green/15 text-naira-green'
                            : 'border-white/10 text-white/50 hover:bg-white/5'
                        }`}
                        onClick={() => { setSelectedChild(child); sound.click(); }}
                      >
                        <div className="w-6 h-6 rounded-full bg-naira-green flex items-center justify-center text-xs font-bold text-white">
                          {child.profile.name[0].toUpperCase()}
                        </div>
                        {child.profile.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Link a new child */}
                <div className="card-glass p-4 mb-5">
                  <h3 className="text-sm font-bold text-white/60 mb-3">Link a child's account</h3>
                  <p className="text-xs text-white/40 mb-3">
                    Ask your child to go to their Profile → copy their Account ID and share it with you here.
                  </p>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white text-sm placeholder-white/25 focus:outline-none focus:border-naira-green transition-colors"
                      placeholder="Child's Account ID (UUID)"
                      value={linkId}
                      onChange={(e) => setLinkId(e.target.value)}
                    />
                    <button
                      className="btn-primary py-2 px-4 text-sm"
                      onClick={handleLink}
                      disabled={linking || !linkId.trim()}
                    >
                      {linking ? '…' : 'Link'}
                    </button>
                  </div>
                  {linkError && <p className="text-red-400 text-xs mt-2">{linkError}</p>}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="card-glass p-4 mb-5 text-sm">
            <p className="text-white/60">
              👆 <span className="text-white font-medium">Cloud mode not enabled.</span> You're viewing your own local progress below.{' '}
              <button
                className="text-naira-green underline hover:no-underline"
                onClick={() => { sound.click(); navigate('/auth'); }}
              >
                Sign in
              </button>{' '}
              to link and monitor a child's separate account.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-5">
          {(['mastery', 'tips'] as const).map((t) => (
            <button
              key={t}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === t ? 'bg-naira-green text-white' : 'text-white/40 hover:text-white/70'
              }`}
              onClick={() => { setTab(t); sound.click(); }}
            >
              {t === 'mastery' ? '📊 Mastery Map' : '💡 Activity Ideas'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'mastery' ? (
            <motion.div
              key="mastery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {CATEGORIES.map((cat, i) => {
                let mastery = 0;
                if (selectedChild) {
                  const p = selectedChild.progress.find((p) => p.category_id === cat.id);
                  mastery = p ? Math.min(1, p.mastery_points / 1000) : 0;
                } else {
                  mastery = selectMasteryPercent(state, cat.id);
                }
                const pct = Math.round(mastery * 100);
                const tier = cat.tier;

                return (
                  <motion.div
                    key={cat.id}
                    className="card-glass p-4"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{cat.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{cat.name}</span>
                          <span className="text-xs text-white/30">Tier {tier}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-sm font-bold"
                          style={{ color: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : pct >= 30 ? '#f97316' : '#ef4444' }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <MasteryBar percent={mastery} color={cat.color} showPercent={false} height="h-2" />
                    {pct < 30 && (
                      <p className="text-xs text-red-400/70 mt-2">⚠️ Needs attention</p>
                    )}
                    {pct >= 80 && (
                      <p className="text-xs text-naira-green mt-2">✓ Mastered!</p>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="tips"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {selectedWeakZones.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <div className="text-4xl mb-3">🏆</div>
                  <p>All zones above 50%! Keep it up.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-white/50 mb-3">
                    Activities to reinforce concepts where mastery is below 50%:
                  </p>
                  {selectedWeakZones.map((cat, i) => (
                    <motion.div
                      key={cat.id}
                      className="card-glass p-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{cat.emoji}</span>
                        <span className="font-display text-white text-sm">{cat.name}</span>
                        <span
                          className="ml-auto text-xs px-2 py-0.5 rounded-full"
                          style={{ background: cat.color + '20', color: cat.color }}
                        >
                          Needs practice
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {(ACTIVITY_TIPS[cat.id] ?? []).map((tip, j) => (
                          <li key={j} className="flex gap-2 text-sm text-white/70">
                            <span className="text-naira-gold mt-0.5 flex-shrink-0">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Child's account ID (for linking) */}
        {!isCloud && profile && (
          <div className="mt-8 card-glass p-4">
            <h3 className="text-sm font-bold text-white/50 mb-2">Your Account ID</h3>
            <p className="text-xs text-white/30 mb-2">Share this with a parent so they can link to your account:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-naira-green bg-naira-green/10 px-3 py-2 rounded-lg break-all">
                {profile.id}
              </code>
              <button
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:bg-white/10 transition-colors"
                onClick={() => { navigator.clipboard.writeText(profile.id); sound.click(); }}
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <button
          className="mt-6 text-sm text-white/30 hover:text-white/60 transition-colors"
          onClick={() => { sound.click(); navigate('/map'); }}
        >
          ← World Map
        </button>
      </main>
    </div>
  );
}
