import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';
import { registerUser, loginUser, logoutUser, subscribeToAuthChanges } from '../services/authService';
import { getUserProfile } from '../services/userService';

interface SignUpResult {
  sessionCreated: boolean;
  emailVerificationSent: boolean;
}

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, username: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signUp(email: string, password: string, fullName: string, username: string): Promise<SignUpResult> {
    await registerUser(email, password, fullName, username);
    return { sessionCreated: true, emailVerificationSent: false };
  }

  async function signIn(email: string, password: string) {
    const firebaseUser = await loginUser(email, password);
    const profile = await getUserProfile(firebaseUser.uid);

    if (profile?.status === 'disabled') {
      await logoutUser();
      throw new Error('Akun Anda telah dinonaktifkan. Silakan hubungi admin.');
    }
    setUser(profile);
  }

  async function signOutUser() {
    await logoutUser();
    setUser(null);
  }

  async function updateProfile(patch: Partial<UserProfile>) {
    // This would typically call userService.updateUserProfile
    // For now, let's just update local state or implement if needed
    console.log('Update profile not fully implemented in service yet', patch);
  }

  async function refreshProfile() {
    if (!user) return;
    const profile = await getUserProfile(user.id);
    setUser(profile);
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    // Implement using firebase/auth if needed
  }

  async function forgotPassword(email: string) {
    // Implement using firebase/auth if needed
  }

  async function deleteAccount() {
    // Implement using firebase/auth if needed
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOutUser,
      updateProfile,
      refreshProfile,
      changePassword,
      forgotPassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
