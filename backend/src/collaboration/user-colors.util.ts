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
export function getRandomUserColor(usedColors: Set<string> = new Set()): string {
  const availableColors = USER_COLORS.filter((color) => !usedColors.has(color));
  const palette = availableColors.length > 0 ? availableColors : USER_COLORS;
  const index = Math.floor(Math.random() * palette.length);
  return palette[index];
}