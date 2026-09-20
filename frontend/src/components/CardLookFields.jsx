import React from 'react';
import { CARD_THEME_OPTIONS, CARD_THEME_PRESETS } from '../utils/cardTheme.js';

// Theme swatches + custom colours. `card` is the card/form object, `setField(key, value)` updates it.
const CardLookFields = ({ card, setField }) => (
  <div>
    <p className="mb-2 text-sm font-medium text-[#1a3d42]/70">Theme</p>
    <div className="flex flex-wrap gap-2">
      {CARD_THEME_OPTIONS.map((option) => {
        const preset = CARD_THEME_PRESETS[option.value];
        const isActive = (card.theme || 'lagoon') === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setField('theme', option.value)}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
              isActive ? 'border-[#0d7377] bg-[#e7f5f4] text-[#1a3d42]' : 'border-black/10 text-[#1a3d42]/70'
            }`}
          >
            <span
              className="h-4 w-4 rounded-full"
              style={{
                background: preset
                  ? `linear-gradient(135deg, ${preset.c1}, ${preset.accent})`
                  : `linear-gradient(135deg, ${card.primaryColor || '#0d7377'}, ${card.accentColor || '#e8913a'})`
              }}
            />
            {option.label}
          </button>
        );
      })}
    </div>

    {card.theme === 'custom' && (
      <div className="mt-3 flex flex-wrap gap-4">
        {[
          ['primaryColor', 'Primary color', '#0d7377'],
          ['accentColor', 'Accent color', '#e8913a']
        ].map(([key, label, fallback]) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs font-medium text-[#1a3d42]/70">{label}</span>
            <input
              type="color"
              value={card[key] || fallback}
              onChange={(e) => setField(key, e.target.value)}
              className="h-9 w-16 rounded border border-black/10"
            />
          </label>
        ))}
      </div>
    )}
  </div>
);

export default CardLookFields;
