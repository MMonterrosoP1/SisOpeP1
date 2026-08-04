const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return true;
  }

  if (now - record.lastReset > windowMs) {
    record.count = 1;
    record.lastReset = now;
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

// Limpiar el map periódicamente para evitar memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now - record.lastReset > 60000) { 
        rateLimitMap.delete(key);
      }
    }
  }, 60000);
}
