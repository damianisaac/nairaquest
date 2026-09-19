import { useEffect, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import TopNav from '../components/ui/TopNav';
import type { WalletTransaction } from '../types';

type MqMessage =
  | { type: 'mq_collect'; netWorth: number }
  | { type: 'mq_complete'; netWorth: number }
  | { type: 'mq_partial'; netWorth: number };

export default function MoneyQuestPage() {
  const { profile } = useGameStore();

  const latestNetWorthRef  = useRef(0);
  const completionRef      = useRef(false);
  const creditAwardedRef   = useRef(false);

  const awardCredits = useCallback((netWorth: number, complete: boolean) => {
    if (creditAwardedRef.current || netWorth <= 0) return;
    creditAwardedRef.current = true;

    const raw     = Math.floor(netWorth * 0.18);
    const amount  = complete ? Math.floor(raw * 1.25) : raw;
    if (amount <= 0) return;

    const label = complete
      ? `Money Quest — level complete! (×1.25 bonus)`
      : `Money Quest — partial run`;

    const tx: WalletTransaction = {
      id:        `mq-${Date.now()}`,
      timestamp: Date.now(),
      category:  null,
      difficulty: null,
      amount,
      type:      'game',
      label,
      game:      'Money Quest',
    };

    useGameStore.setState((s) => {
      if (!s.profile) return s;
      return {
        profile: {
          ...s.profile,
          walletBalance:      s.profile.walletBalance + amount,
          walletTransactions: [...s.profile.walletTransactions, tx],
        },
      };
    });
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data as MqMessage;
      if (!data || typeof data.type !== 'string') return;

      if (data.type === 'mq_collect') {
        latestNetWorthRef.current = data.netWorth;
      } else if (data.type === 'mq_complete') {
        latestNetWorthRef.current = data.netWorth;
        completionRef.current = true;
        awardCredits(data.netWorth, true);
      } else if (data.type === 'mq_partial') {
        awardCredits(data.netWorth, false);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [awardCredits]);

  // Award partial credits on unmount if game was in progress
  useEffect(() => {
    return () => {
      if (!completionRef.current) {
        awardCredits(latestNetWorthRef.current, false);
      }
    };
  }, [awardCredits]);

  if (!profile) return <Navigate to="/" replace />;

  const track = profile.ageTrack;
  const name  = encodeURIComponent(profile.name ?? 'Player');
  const src   = `/games/money-quest.html?track=${track}&name=${name}`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a12' }}>
      <TopNav />
      <main className="flex-1 flex flex-col pt-16">
        <iframe
          src={src}
          title="Money Quest"
          className="flex-1 w-full border-0"
          style={{ minHeight: 'calc(100vh - 64px)' }}
          allow="autoplay"
          sandbox="allow-scripts allow-same-origin"
        />
      </main>
    </div>
  );
}
