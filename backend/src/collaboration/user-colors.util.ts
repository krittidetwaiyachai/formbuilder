const USER_COLORS = [
'#ef4444',
'#f59e0b',
'#10b981',
'#3b82f6',
'#8b5cf6',
'#ec4899',
'#06b6d4',
'#84cc16',
'#f97316',
'#6366f1'];
export function getUserColor(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}