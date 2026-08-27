import React from 'react';

const AppSplash = ({ message = 'Opening your digital card' }) => (
  <div className="km-app-splash" role="status" aria-live="polite">
    <div className="km-app-splash-mark">
      <img src="/logos/kadi-moja-mark.svg" alt="" />
    </div>
    <p className="km-app-splash-name">Kadi Moja</p>
    <p className="km-app-splash-copy">{message}</p>
    <div className="km-app-splash-dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  </div>
);

export default AppSplash;
