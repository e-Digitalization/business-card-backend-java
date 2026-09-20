import React from 'react';
import { CARD_FIELDS } from '../utils/cardFields.js';
import CategoryPicker from './CategoryPicker.jsx';
import VideoListEditor from './VideoListEditor.jsx';

const linkedInSearchUrl = (card) => {
  const keywords = [card.fullName, card.company].map((v) => (v || '').trim()).filter(Boolean).join(' ');
  return keywords
    ? `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keywords)}`
    : null;
};

const isProfileUrl = (value) => /^https?:\/\/([\w-]+\.)?linkedin\.com\//i.test((value || '').trim());

const LinkedInLink = ({ card }) => {
  const linkClass = 'text-xs font-semibold text-[#0a66c2] hover:underline';
  if (isProfileUrl(card.linkedin)) {
    return (
      <a href={card.linkedin.trim()} target="_blank" rel="noopener noreferrer" className={linkClass}>
        Open profile ↗
      </a>
    );
  }
  const url = linkedInSearchUrl(card);
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>
      Find on LinkedIn ↗
    </a>
  );
};

// The details section of a card, identical on the create page and in the edit dialog.
// `wide` switches the grid to 3 columns for full-width pages; the field order never changes.
const CardDetailsFields = ({ card, setField, wide = false }) => {
  const span = wide ? 'sm:col-span-2 lg:col-span-3' : 'sm:col-span-2';
  return (
    <div className={`grid gap-x-4 gap-y-3.5 sm:grid-cols-2 ${wide ? 'lg:grid-cols-3' : ''}`}>
      {CARD_FIELDS.map(([key, label, placeholder]) => (
        <label key={key} className="block">
          <span className="mb-1 flex items-center justify-between gap-2 text-sm font-medium text-[#1a3d42]/70">
            {label}
            {key === 'linkedin' && <LinkedInLink card={card} />}
          </span>
          <input
            value={card[key] || ''}
            onChange={(e) => setField(key, e.target.value)}
            placeholder={placeholder}
            required={key === 'fullName'}
            className="admin-input"
          />
        </label>
      ))}
      <div className={span}>
        <CategoryPicker value={card.categories || ''} onChange={(next) => setField('categories', next)} />
      </div>
      <div className={span}>
        <VideoListEditor value={card.youtubeVideos || ''} onChange={(next) => setField('youtubeVideos', next)} />
      </div>
    </div>
  );
};

export default CardDetailsFields;
