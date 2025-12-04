// Utilitaire pour des logs plus propres en développement
export const logger = {
  info: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`ℹ️ ${message}`, data || '');
    }
  },
  
  success: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${message}`, data || '');
    }
  },
  
  warning: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ ${message}`, data || '');
    }
  },
  
  error: (message, error = null) => {
    console.error(`❌ ${message}`, error || '');
  },
  
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`🔍 ${message}`, data || '');
    }
  },
  
  api: (method, url, status, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const statusIcon = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : 'ℹ️';
      console.log(`${statusIcon} ${method.toUpperCase()} ${url} (${status})`, data ? `\nData:` : '', data || '');
    }
  },
  
  table: (data, title = '') => {
    if (process.env.NODE_ENV === 'development' && data) {
      if (title) console.log(`📊 ${title}`);
      console.table(data);
    }
  }
};

export default logger;