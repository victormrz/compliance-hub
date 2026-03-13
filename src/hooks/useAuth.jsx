import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { graphScopes } from '../lib/msalConfig';
import { initGraphClient, getCurrentUser } from '../lib/graphService';
import { getUserRole, getPermissions, canAccessPage, canCreateOnPage } from '../lib/roles';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get access token for Graph API
  const getAccessToken = useCallback(async () => {
    if (!accounts[0]) throw new Error('No account logged in');
    try {
      const response = await instance.acquireTokenSilent({
        scopes: graphScopes.all,
        account: accounts[0],
      });
      return response.accessToken;
    } catch (err) {
      const response = await instance.acquireTokenPopup({
        scopes: graphScopes.all,
      });
      return response.accessToken;
    }
  }, [instance, accounts]);

  // DEV ONLY: test mode sets a mock admin user
  const isTestMode = import.meta.env.DEV && new URLSearchParams(window.location.search).get('test') === '1';

  useEffect(() => {
    if (isTestMode && !user) {
      const role = 'admin';
      const permissions = getPermissions(role);
      setUser({
        name: 'Victor Rivera',
        email: 'victor@roaringbrookrecovery.com',
        title: 'Executive Director',
        department: 'Management',
        role,
        permissions,
      });
      setLoading(false);
      return;
    }
  }, [isTestMode, user]);

  // Initialize Graph client when authenticated
  useEffect(() => {
    if (isAuthenticated && accounts[0]) {
      initGraphClient(getAccessToken);

      getCurrentUser()
        .then(profile => {
          const email = profile.mail || profile.userPrincipalName || accounts[0].username;
          const role = getUserRole(email);
          const permissions = getPermissions(role);
          setUser({
            name: profile.displayName,
            email,
            title: profile.jobTitle,
            department: profile.department,
            role,
            permissions,
          });
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to get user profile:', err);
          const email = accounts[0].username;
          const role = getUserRole(email);
          const permissions = getPermissions(role);
          setUser({
            name: accounts[0].name,
            email,
            title: '',
            department: '',
            role,
            permissions,
          });
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, accounts, getAccessToken]);

  const login = async () => {
    try {
      setError(null);
      await instance.loginPopup({
        scopes: graphScopes.all,
      });
    } catch (err) {
      setError(err.message);
      console.error('Login failed:', err);
    }
  };

  const logout = () => {
    instance.logoutPopup();
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      error,
      login,
      logout,
      getAccessToken,
      // Role helpers
      canAccess: (path) => user ? canAccessPage(user.role, path) : false,
      canCreate: (path) => user ? canCreateOnPage(user.role, path) : false,
      canEdit: user?.permissions?.canEdit || false,
      canDelete: user?.permissions?.canDelete || false,
      canExport: user?.permissions?.canExport || false,
      canManageUsers: user?.permissions?.canManageUsers || false,
      isAdmin: user?.role === 'admin',
      isManager: user?.role === 'manager' || user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
