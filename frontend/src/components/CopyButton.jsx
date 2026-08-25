import React, { useState } from 'react';

const copyToClipboard = async (value) => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const el = document.createElement('textarea');
      el.value = value;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
};

/** Button that copies `value` to the clipboard and briefly swaps its label to confirm. */
const CopyButton = ({ value, label = 'Copy link', copiedLabel = 'Copied!', className = '' }) => {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button type="button" onClick={onClick} className={className}>
      {copied ? copiedLabel : label}
    </button>
  );
};

export default CopyButton;
export { copyToClipboard };
