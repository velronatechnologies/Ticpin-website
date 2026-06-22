import * as React from "react";

export function useCurrentTime(intervalMs = 60000) {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (intervalMs <= 0) return;
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}
