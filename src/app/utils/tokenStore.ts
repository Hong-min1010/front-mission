export type StoreKind = 'local' | 'session';

export const tokenStore = {
  active(): StoreKind | null {
    if (localStorage.getItem('accessToken')) return 'local';
    if (sessionStorage.getItem('accessToken')) return 'session';
    return null;
  },
  set(access: string, refresh?: string, remember = false) {
    const A = remember ? localStorage : sessionStorage;
    const B = remember ? sessionStorage : localStorage;
    B.removeItem('accessToken'); B.removeItem('refreshToken');

    A.setItem('accessToken', access);
    if (refresh) A.setItem('refreshToken', refresh);
  },
  getAccess(): string | null {
    return localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');
  },
  getRefresh(): string | null {
    return localStorage.getItem('refreshToken') ?? sessionStorage.getItem('refreshToken');
  },
  setRespectActive(access: string, refresh?: string) {
    const active = this.active();
    if (!active) return this.set(access, refresh, false);
    const A = active === 'local' ? localStorage : sessionStorage;
    A.setItem('accessToken', access);
    if (refresh) A.setItem('refreshToken', refresh);
  },
  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  },
};
