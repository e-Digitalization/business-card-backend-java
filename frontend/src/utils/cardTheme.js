// Preset hero-gradient + accent colors for public card "looks".
// "lagoon" matches the original hardcoded card design exactly, so any card
// without a theme (or a theme unknown to this map) renders unchanged.
export const CARD_THEME_PRESETS = {
  lagoon: { c1: '#0a5f63', c2: '#0d7377', c3: '#1a3d42', accent: '#e8913a' },
  midnight: { c1: '#1e1b4b', c2: '#312e81', c3: '#4c1d95', accent: '#f59e0b' },
  sunset: { c1: '#7c2d12', c2: '#c2410c', c3: '#9a3412', accent: '#fbbf24' }
};

export const CARD_THEME_OPTIONS = [
  { value: 'lagoon', label: 'Lagoon' },
  { value: 'midnight', label: 'Midnight' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'custom', label: 'Custom' }
];

export function getCardThemePreset(card) {
  if (card?.theme === 'custom') {
    const primary = card.primaryColor || CARD_THEME_PRESETS.lagoon.c2;
    return { c1: primary, c2: primary, c3: primary, accent: card.accentColor || primary };
  }
  return CARD_THEME_PRESETS[card?.theme] || CARD_THEME_PRESETS.lagoon;
}

export function getCardThemeVars(card) {
  const preset = getCardThemePreset(card);
  return {
    '--km-card-c1': preset.c1,
    '--km-card-c2': preset.c2,
    '--km-card-c3': preset.c3,
    '--km-card-accent': preset.accent
  };
}
