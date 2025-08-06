const levels = ['debug', 'info', 'warn', 'error'];
let current = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_LOG_LEVEL) ? import.meta.env.VITE_LOG_LEVEL.toLowerCase() : 'warn';

function shouldLog(level) {
  return levels.indexOf(level) >= levels.indexOf(current);
}

export const logger = {
  setLevel(level) {
    if (levels.includes(level)) {
      current = level;
    }
  },
  debug: (...args) => shouldLog('debug') && console.debug(...args),
  info: (...args) => shouldLog('info') && console.info(...args),
  warn: (...args) => shouldLog('warn') && console.warn(...args),
  error: (...args) => console.error(...args)
};

export default logger;
