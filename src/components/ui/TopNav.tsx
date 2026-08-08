import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';
import { sound } from './SoundController';
import BalanceTickUp from './BalanceTickUp';
import { WALLET_NAMES } from '../../utils/wallet';
import AboutModal from './AboutModal';
import SettingsPanel from './SettingsPanel';

export default function TopNav() {
  const { profile, soundEnabled, toggleSound } = useGameStore();
  const { user, syncing, syncNow, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    sound.click();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSync = async () => {
    sound.click();
    await syncNow();
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 backdrop-blur-md border-b border-white/10"
        style={{ background: 'rgba(3, 7, 18, 0.88)' }}
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-naira-green/20 border border-naira-green/40 text-white text-xs sm:text-sm font-bold hover:bg-naira-green/30 transition-colors"
          onClick={() => sound.click()}
        >
          ₦airaQuest
        </Link>

        <div className="flex items-center gap-2">
          {profile && (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm text-white/60">
                <span className="text-naira-gold font-bold">Lv {profile.level}</span>
                <span className="text-white/20">·</span>
                <span>{profile.dailyStreak}🔥</span>
              </div>

              {/* Wallet balance chip */}
              <button
                onClick={() => { sound.click(); navigate('/wallet'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-naira-gold/10 border border-naira-gold/30 hover:bg-naira-gold/20 transition-all group"
                title={`${WALLET_NAMES[profile.ageTrack].title} — Play Naira (game points only)`}
              >
                <span className="text-sm">{WALLET_NAMES[profile.ageTrack].icon}</span>
                <BalanceTickUp
                  value={profile.walletBalance}
                  className="text-naira-gold font-bold text-xs"
                />
              </button>

              {/* Leaderboard */}
              <button
                onClick={() => { sound.click(); navigate('/leaderboard'); }}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:bg-white/10 hover:text-white/80 transition-all"
              >
                🏆 Board
              </button>

              {/* Cloud sync button */}
              {isSupabaseConfigured && (
                <button
                  onClick={handleSync}
                  title={user ? 'Sync to cloud' : 'Sign in to sync'}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm hover:bg-white/10 transition-colors"
                >
                  {syncing ? (
                    <span className="w-3 h-3 border border-white/30 border-t-naira-green rounded-full animate-spin" />
                  ) : user ? (
                    '☁️'
                  ) : (
                    '🔗'
                  )}
                </button>
              )}

              <button
                onClick={() => { sound.click(); setMenuOpen((v) => !v); }}
                className="w-8 h-8 rounded-full bg-naira-green/20 border border-naira-green/40 flex items-center justify-center text-sm font-bold hover:bg-naira-green/40 transition-colors"
              >
                {profile.name[0].toUpperCase()}
              </button>
            </>
          )}

          {!profile && (
            <button
              className="btn-primary py-1.5 px-4 text-sm"
              onClick={() => { sound.click(); navigate('/?onboard=1'); }}
            >
              Start
            </button>
          )}

          {/* Login */}
          {isSupabaseConfigured && !user && (
            <button
              onClick={() => { sound.click(); navigate('/auth'); }}
              className="flex items-center px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-xs text-blue-300 font-semibold hover:bg-blue-500/30 transition-all"
            >
              Login
            </button>
          )}

          {/* About — text on desktop, ℹ icon on mobile */}
          <button
            onClick={() => { sound.click(); setShowAbout(true); }}
            className="flex items-center justify-center px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 transition-all"
            title="About NairaQuest"
          >
            <span className="hidden sm:block text-xs">About</span>
            <svg className="block sm:hidden w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2.5" />
            </svg>
          </button>

          {/* Settings */}
          <button
            onClick={() => { sound.click(); setShowSettings(true); }}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-base hover:bg-white/10 transition-colors"
            title="Settings"
          >
            ⚙️
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {isFullscreen ? (
                <>
                  <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                  <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                  <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                  <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                </>
              ) : (
                <>
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </>
              )}
            </svg>
          </button>

          {/* Sound */}
          <button
            onClick={() => { toggleSound(); sound.click(); }}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm hover:bg-white/10 transition-colors"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </motion.nav>

      {/* About modal */}
      <AnimatePresence>
        {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      </AnimatePresence>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      </AnimatePresence>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && profile && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed top-14 right-4 z-50 w-52 card-glass py-2 shadow-2xl"
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <NavItem icon="🗺️" label="World Map" onClick={() => { setMenuOpen(false); navigate('/map'); }} />
              <NavItem icon="👤" label="Profile" onClick={() => { setMenuOpen(false); navigate('/profile'); }} />
              <NavItem icon="🏆" label="Leaderboard" onClick={() => { setMenuOpen(false); navigate('/leaderboard'); }} />
              <NavItem
                icon={WALLET_NAMES[profile.ageTrack].icon}
                label={WALLET_NAMES[profile.ageTrack].title}
                onClick={() => { setMenuOpen(false); navigate('/wallet'); }}
              />
              <NavItem icon="👨‍👩‍👧" label="Family Hub" onClick={() => { setMenuOpen(false); navigate('/family'); }} />
              {profile.ageTrack === 'kids' && (
                <NavItem icon="👩‍👧" label="Parent View" onClick={() => { setMenuOpen(false); navigate('/parent'); }} />
              )}
              {(profile.userRole ?? 'general') === 'teacher' && (
                <NavItem icon="👨‍🏫" label="Teacher Dashboard" onClick={() => { setMenuOpen(false); navigate('/teacher'); }} />
              )}
              <NavItem icon="🏫" label="Join a Class" onClick={() => { setMenuOpen(false); navigate('/class/join'); }} />
              <div className="h-px bg-white/10 my-1 mx-3" />
              {isSupabaseConfigured && (
                user ? (
                  <NavItem
                    icon="🚪"
                    label="Sign Out"
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    danger
                  />
                ) : (
                  <NavItem
                    icon="🔗"
                    label="Sign In / Sign Up"
                    onClick={() => { setMenuOpen(false); navigate('/auth'); }}
                  />
                )
              )}
              <div className="px-4 py-2 text-xs text-white/25">
                {user ? `Signed in · ${user.email?.slice(0, 20)}` : 'Local mode only'}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({
  icon, label, onClick, danger = false,
}: {
  icon: string; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
        danger ? 'text-red-400' : 'text-white/70'
      }`}
      onClick={() => { sound.click(); onClick(); }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
