import { useState } from 'react';
import { motion } from 'framer-motion';
import { AVATAR_ITEMS, getUnlockedItems } from '../../data/avatarItems';
import type { UserProfile, AvatarItem } from '../../types';
import { sound } from './SoundController';

type CategoryTab = 'all' | AvatarItem['category'];
const TABS: { id: CategoryTab; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'hat', label: 'Hats', emoji: '🎩' },
  { id: 'accessory', label: 'Accessories', emoji: '🕶️' },
  { id: 'frame', label: 'Frames', emoji: '🖼️' },
  { id: 'badge', label: 'Badges', emoji: '🏅' },
];

interface Props {
  profile: UserProfile;
  onSave: (itemIds: string[]) => void;
  onClose: () => void;
}

export function AvatarPreview({
  profile,
  size = 80,
}: {
  profile: UserProfile;
  size?: number;
}) {
  const equipped = profile.avatarItemIds ?? [];
  const hat = AVATAR_ITEMS.find((i) => i.category === 'hat' && equipped.includes(i.id));
  const acc = AVATAR_ITEMS.find((i) => i.category === 'accessory' && equipped.includes(i.id));
  const frame = AVATAR_ITEMS.find((i) => i.category === 'frame' && equipped.includes(i.id));
  const badge = AVATAR_ITEMS.find((i) => i.category === 'badge' && equipped.includes(i.id));

  const frameColors: Record<string, string> = {
    'frame-gold': 'from-naira-gold to-yellow-600',
    'frame-naira': 'from-naira-green to-naira-green-light',
    'frame-fire': 'from-orange-500 to-red-600',
    'frame-diamond': 'from-blue-400 to-purple-500',
  };
  const frameClass = frame ? frameColors[frame.id] ?? 'from-naira-green to-naira-green-light' : 'from-naira-green-dark to-naira-green';

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {/* Frame ring */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${frameClass} p-0.5`}
        style={{ opacity: frame ? 1 : 0.6 }}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center font-display font-bold text-white"
          style={{ background: '#012b1d', fontSize: size * 0.38 }}
        >
          {profile.name[0].toUpperCase()}
        </div>
      </div>

      {/* Hat */}
      {hat && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-center"
          style={{ fontSize: size * 0.35, lineHeight: 1 }}
        >
          {hat.emoji}
        </div>
      )}

      {/* Accessory */}
      {acc && (
        <div
          className="absolute -right-2 top-1/2 -translate-y-1/2 text-center"
          style={{ fontSize: size * 0.3, lineHeight: 1 }}
        >
          {acc.emoji}
        </div>
      )}

      {/* Badge pin */}
      {badge && (
        <div
          className="absolute -bottom-1 -right-1"
          style={{ fontSize: size * 0.3, lineHeight: 1 }}
        >
          {badge.emoji}
        </div>
      )}
    </div>
  );
}

export default function AvatarCustomizer({ profile, onSave, onClose }: Props) {
  const [equippedIds, setEquippedIds] = useState<string[]>(profile.avatarItemIds ?? []);
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');

  const unlocked = getUnlockedItems(profile.earnedBadgeIds, profile.level, profile.dailyStreak);
  const filtered = AVATAR_ITEMS.filter((item) => activeTab === 'all' || item.category === activeTab);

  const toggle = (itemId: string) => {
    const item = AVATAR_ITEMS.find((i) => i.id === itemId);
    if (!item || !unlocked.includes(itemId)) return;
    sound.click();

    setEquippedIds((prev) => {
      const sameCategory = AVATAR_ITEMS
        .filter((i) => i.category === item.category)
        .map((i) => i.id);
      const withoutCategory = prev.filter((id) => !sameCategory.includes(id));
      // Toggle: if already equipped, unequip
      if (prev.includes(itemId)) return withoutCategory;
      return [...withoutCategory, itemId];
    });
  };

  const previewProfile = { ...profile, avatarItemIds: equippedIds };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-md card-glass overflow-hidden"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-white text-lg">Customize Avatar</h2>
            <button
              className="text-white/40 hover:text-white/70 text-xl w-8 h-8 flex items-center justify-center"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          {/* Live preview */}
          <div className="flex justify-center">
            <AvatarPreview profile={previewProfile} size={96} />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto p-3 border-b border-white/8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-naira-green text-white'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
              }`}
              onClick={() => { setActiveTab(tab.id); sound.click(); }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Item grid */}
        <div className="p-4 grid grid-cols-4 gap-2 max-h-56 overflow-y-auto">
          {filtered.map((item) => {
            const isUnlocked = unlocked.includes(item.id);
            const isEquipped = equippedIds.includes(item.id);
            return (
              <motion.button
                key={item.id}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${
                  isEquipped
                    ? 'border-naira-green bg-naira-green/15'
                    : isUnlocked
                    ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25'
                    : 'border-white/5 bg-white/2 opacity-40 cursor-not-allowed'
                }`}
                onClick={() => toggle(item.id)}
                whileHover={isUnlocked ? { scale: 1.04 } : {}}
                whileTap={isUnlocked ? { scale: 0.96 } : {}}
              >
                <span className="text-2xl">{isUnlocked ? item.emoji : '🔒'}</span>
                <span className="text-xs text-white/60 leading-tight line-clamp-1">{item.name}</span>
                {isEquipped && (
                  <motion.div
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-naira-green flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
                {!isUnlocked && (
                  <span className="text-xs text-white/30 leading-tight mt-0.5 line-clamp-2">
                    {item.unlockCondition}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/8 flex gap-3">
          <button
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 btn-gold"
            onClick={() => { sound.coinDrop(); onSave(equippedIds); onClose(); }}
          >
            Save Look ✓
          </button>
        </div>
      </motion.div>
    </div>
  );
}
