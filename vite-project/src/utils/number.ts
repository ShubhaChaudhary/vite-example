const padLeft = (number: number, n: number, str = '0') =>
  number.toString().length >= n
    ? number
    : Array(n - String(number).length + 1).join(str) + number;

export const playTime = (milliseconds: number, forceHours = false) => {
  const seconds = Math.floor(milliseconds / 1000.0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const onlySeconds = Math.round(seconds % 60);
  const parts = [];

  if (forceHours || hours >= 1) {
    parts.push(padLeft(hours, 2));
  }
  parts.push(padLeft(minutes, 2));
  parts.push(padLeft(onlySeconds, 2));

  return parts.join(':');
};