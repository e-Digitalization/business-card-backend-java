// Explicit Play takes precedence over pointer hover; tab visibility always wins.
export const canAdvance = ({ paused, hovered, hidden, reducedMotion, explicitPlay }) =>
  !paused && !hidden && (explicitPlay || (!hovered && !reducedMotion));
