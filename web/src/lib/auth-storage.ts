const KEY = 'school-mngt:refresh-token';

export const authStorage = {
  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  
  setRefreshToken: (token: string): void => {
    try {
      localStorage.setItem(KEY, token);
    } catch {
      // quota errors must be silent
    }
  },
  
  clearRefreshToken: (): void => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
};
