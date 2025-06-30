import React, { createContext, useContext } from 'react';
import useAuthHook from '../hooks/useAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuthHook();
  return (
    <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
