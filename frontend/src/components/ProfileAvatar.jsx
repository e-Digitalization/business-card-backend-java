import React, { useState } from 'react';
import { initialsFromName, resolveMediaUrl } from '../utils/media.js';

const ProfileAvatar = ({
  name = '',
  photoUrl = '',
  logoUrl = '',
  className = 'h-11 w-11 rounded-lg',
  textClassName = 'text-sm'
}) => {
  const src = resolveMediaUrl(photoUrl || logoUrl || '');
  const [failed, setFailed] = useState(false);
  const initials = initialsFromName(name);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        className={`${className} border border-black/5 object-cover`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center border border-black/5 bg-[#0d7377] font-bold tracking-wide text-white ${textClassName}`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
};

export default ProfileAvatar;
