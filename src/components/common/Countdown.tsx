import * as React from 'react';

interface CountdownProps {
  targetDate: number; // timestamp in ms
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = React.useState(targetDate - Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(targetDate - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft <= 0) return null;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <div className="flex gap-2 text-center text-xs font-mono bg-slate-100 p-2 rounded-lg">
      <div>{String(days).padStart(2, '0')}<span className="block text-[8px] uppercase">D</span></div>
      <div>{String(hours).padStart(2, '0')}<span className="block text-[8px] uppercase">H</span></div>
      <div>{String(minutes).padStart(2, '0')}<span className="block text-[8px] uppercase">M</span></div>
      <div>{String(seconds).padStart(2, '0')}<span className="block text-[8px] uppercase">S</span></div>
    </div>
  );
}
