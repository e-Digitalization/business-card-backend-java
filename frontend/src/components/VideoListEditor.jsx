import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { MAX_FEATURED_VIDEOS, youtubeVideoId } from '../utils/profileLinks.js';

// Edits a newline-separated list of YouTube video links. `value` is the raw
// stored string; `onChange` receives the updated string. Blank rows are kept
// while editing and only trimmed away on save by the parent form / parser.
const VideoListEditor = ({ value, onChange, accent = '#9a6b45' }) => {
  const rows = String(value || '').split('\n');
  const display = rows.length ? rows : [''];
  const filled = display.filter((r) => r.trim()).length;

  const commit = (next) => onChange(next.join('\n'));

  const setRow = (index, next) => {
    const copy = display.slice();
    copy[index] = next;
    commit(copy);
  };

  const removeRow = (index) => {
    const copy = display.slice();
    copy.splice(index, 1);
    commit(copy.length ? copy : ['']);
  };

  const addRow = () => commit([...display, '']);

  return (
    <div className="km-video-editor">
      <div className="km-video-editor-head">
        <div>
          <p className="km-video-editor-title">Featured videos</p>
          <p className="km-video-editor-hint">
            Paste a YouTube link or video ID. They appear as a swipeable slider on the card.
          </p>
        </div>
        <span className="km-video-editor-badge">
          {filled}/{MAX_FEATURED_VIDEOS}
        </span>
      </div>

      <div className="km-video-editor-rows">
        {display.map((row, index) => {
          const id = youtubeVideoId(row);
          const invalid = row.trim() && !id;
          return (
            <div className="km-video-row" key={index}>
              <div className="km-video-thumb" aria-hidden="true">
                {id ? (
                  <img src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" loading="lazy" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              <div className="km-video-row-body">
                <input
                  value={row}
                  onChange={(e) => setRow(index, e.target.value)}
                  placeholder="https://youtu.be/…"
                  className={`admin-input ${invalid ? 'km-video-input-invalid' : ''}`}
                />
                {invalid && <span className="km-video-row-error">Not a recognisable YouTube link</span>}
              </div>

              <button
                type="button"
                className="km-video-remove"
                onClick={() => removeRow(index)}
                aria-label={`Remove video ${index + 1}`}
                disabled={display.length === 1 && !row.trim()}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          );
        })}
      </div>

      {filled < MAX_FEATURED_VIDEOS && (
        <button
          type="button"
          onClick={addRow}
          className="km-video-add"
          style={{ color: accent, borderColor: `${accent}55` }}
        >
          <AddIcon sx={{ fontSize: 18 }} />
          Add video
        </button>
      )}
    </div>
  );
};

export default VideoListEditor;
