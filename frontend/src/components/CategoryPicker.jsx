import React from 'react';
import { CARD_CATEGORIES, parseCategories, toggleCategory } from '../utils/cardCategories.js';

// Multi-select chips for the card's profile categories. `value` / `onChange`
// use the comma-separated string stored on the card.
const CategoryPicker = ({ value, onChange, readOnly = false }) => {
  const selected = parseCategories(value);

  if (readOnly) {
    return (
      <div className="km-video-editor">
        <p className="km-video-editor-title">Profile categories</p>
        <p className="km-video-editor-hint">
          Categories are assigned by a Kadi Moja admin. Contact us to add or change them.
        </p>
        <div className="km-category-picker">
          {selected.length ? (
            CARD_CATEGORIES.filter((c) => selected.includes(c.id)).map((c) => (
              <span key={c.id} className="km-category-chip is-active">
                {c.label}
              </span>
            ))
          ) : (
            <span className="text-sm text-[#1a3d42]/50">None assigned</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="km-video-editor">
      <p className="km-video-editor-title">Profile categories</p>
      <p className="km-video-editor-hint">Pick every category that applies — extra sections appear on the card.</p>
      <div className="km-category-picker">
        {CARD_CATEGORIES.map((c) => {
          const on = selected.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              className={`km-category-chip ${on ? 'is-active' : ''}`}
              onClick={() => onChange(toggleCategory(value, c.id))}
            >
              {on ? '✓ ' : ''}
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPicker;
