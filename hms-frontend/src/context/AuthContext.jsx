import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const ROLE_ROUTES = {
  PATIENT: '/patient/dashboard',
  DOCTOR: '/doctor/dashboard',
  ADMIN: '/admin/dashboard',
  SUPER_ADMIN: '/admin/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  PHARMACIST: '/pharmacist/dashboard',
  LAB_TECHNICIAN: '/lab/dashboard',
};

// Will be set by App.jsx after NotificationProvider is available
let _refreshNotifications = null;
let _clearNotifications = null;
export function setNotificationFns(refreshFn, clearFn) {
  _refreshNotifications = refreshFn;
  _clearNotifications = clearFn;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userName = localStorage.getItem('userName');
    return token ? { token, role, userName } : { token: null, role: null, userName: null };
  });

  const login = useCallback((token, role, userName) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userName', userName);
    setAuth({ token, role, userName });

    // Refresh notifications from backend after login
    setTimeout(() => {
      if (_refreshNotifications) _refreshNotifications();
    }, 500);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    setAuth({ token: null, role: null, userName: null });
    // Clear local notification state
    if (_clearNotifications) _clearNotifications();
  }, []);

  const isAuthenticated = () => !!auth.token;

  const getDashboardRoute = (role) => ROLE_ROUTES[role] || '/';

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, isAuthenticated, getDashboardRoute }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export { ROLE_ROUTES };
export default AuthContext;
