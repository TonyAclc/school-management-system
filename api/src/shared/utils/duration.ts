export const parseDuration = (duration: string): number => {
  const match = duration.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'ms': return value;
    case 's': return value * 1000;
    case 'm': return value * 1000 * 60;
    case 'h': return value * 1000 * 60 * 60;
    case 'd': return value * 1000 * 60 * 60 * 24;
    default: return 0;
  }
};
