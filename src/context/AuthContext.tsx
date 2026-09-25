import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  demoProfiles: UserProfile[];
  personalAccount: UserProfile | null;
  validateMatchingEmails: (bookClubEmail: string, libraryEmail: string) => { isValid: boolean; message: string };
  signIn: (email: string, password: string, libraryEmail?: string) => Promise<{ success: boolean; message: string }>;
  signUp: (username: string, email: string, password: string, libraryEmail: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => void;
  switchProfile: (profileId: string) => { success: boolean; message: string };
  updateProfile: (updates: Partial<UserProfile>) => boolean;
}

const STORAGE_KEY_AUTH = 'bf_current_user';
const STORAGE_KEY_PERSONAL = 'bf_personal_account';

// Pre-configured Demo accounts
export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'demo-user-1',
    username: 'AD2600',
    bookClubEmail: 'hudsonexap@gmail.com',
    libraryEmail: 'hudsonexap@gmail.com',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AD2600',
    bio: 'Club reader on Books & Friends',
    favoriteGenre: 'Sci-Fi & Speculative',
    role: 'user',
    isDemo: true,
    clubsCount: 3,
    completedBooksCount: 0,
    chaptersReadCount: 0,
    createdAt: '2026-08-12T10:00:00.000Z',
  },
  {
    id: 'demo-user-2',
    username: 'Clara_Reads',
    bookClubEmail: 'clara.reader@outlook.com',
    libraryEmail: 'clara.reader@outlook.com',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Clara',
    bio: 'Curator of midnight archives & poetry circles.',
    favoriteGenre: 'Literary & Historical',
    role: 'user',
    isDemo: true,
    clubsCount: 2,
    completedBooksCount: 1,
    chaptersReadCount: 15,
    createdAt: '2026-08-20T14:30:00.000Z',
  },
];

// Developer Admin Profile (Concealed from public directory)
const ADMIN_PROFILE: UserProfile = {
  id: 'admin-owner-001',
  username: 'Developer Admin',
  bookClubEmail: ADMIN_EMAIL,
  libraryEmail: ADMIN_EMAIL,
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminOwner',
  bio: 'System Administrator & Database Owner. Full RBAC privileges active.',
  favoriteGenre: 'All Archival Literature',
  role: 'admin',
  isDemo: false,
  clubsCount: 12,
  completedBooksCount: 28,
  chaptersReadCount: 320,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [personalAccount, setPersonalAccount] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PERSONAL);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse personal account', e);
    }
    return null;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored user', e);
    }
    // Default to the first demo user (AD2600) for instant interactive review
    return DEMO_PROFILES[0];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }, [user]);

  useEffect(() => {
    if (personalAccount) {
      localStorage.setItem(STORAGE_KEY_PERSONAL, JSON.stringify(personalAccount));
    } else {
      localStorage.removeItem(STORAGE_KEY_PERSONAL);
    }
  }, [personalAccount]);

  /**
   * Mail Validation Rule:
   * The Book Club Mail and Library Mail within Book & Friend must match.
   */
  const validateMatchingEmails = (bookClubEmail: string, libraryEmail: string) => {
    const cleanClub = bookClubEmail.trim().toLowerCase();
    const cleanLib = libraryEmail.trim().toLowerCase();

    if (!cleanClub || !cleanLib) {
      return {
        isValid: false,
        message: 'Both Book Club Mail and Library Mail are required.',
      };
    }

    if (cleanClub !== cleanLib) {
      return {
        isValid: false,
        message: 'Mail Validation Error: The Book Club Mail and Library Mail within Book & Friend must match.',
      };
    }

    return {
      isValid: true,
      message: 'Matching Mail Validated. Borrowing status & Open Library sync enabled.',
    };
  };

  /**
   * User Sign-In with Developer Admin privilege check
   */
  const signIn = async (email: string, password: string, libraryEmail?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if logging in as Developer Admin
    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      if (password === ADMIN_PASSWORD) {
        setUser(ADMIN_PROFILE);
        return {
          success: true,
          message: 'Authenticated as Developer Admin. Full database management privileges granted.',
        };
      } else {
        return {
          success: false,
          message: 'Invalid credentials for Developer Admin.',
        };
      }
    }

    // For standard users, validate matching email requirement if libraryEmail is supplied
    if (libraryEmail && libraryEmail.trim()) {
      const validation = validateMatchingEmails(cleanEmail, libraryEmail);
      if (!validation.isValid) {
        return { success: false, message: validation.message };
      }
    }

    // Check against demo accounts or registered user
    const matchedDemo = DEMO_PROFILES.find((p) => p.bookClubEmail.toLowerCase() === cleanEmail);
    if (matchedDemo) {
      setUser(matchedDemo);
      return { success: true, message: `Welcome back, ${matchedDemo.username}!` };
    }

    // If new personal user
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      username: cleanEmail.split('@')[0],
      bookClubEmail: cleanEmail,
      libraryEmail: libraryEmail ? libraryEmail.trim().toLowerCase() : cleanEmail,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
      bio: 'Club reader on Books & Friends',
      favoriteGenre: 'Sci-Fi & Speculative',
      role: 'user',
      isDemo: false,
      clubsCount: 1,
      completedBooksCount: 0,
      chaptersReadCount: 0,
      createdAt: new Date().toISOString(),
    };

    setPersonalAccount(newUser);
    setUser(newUser);
    return { success: true, message: `Signed in as ${newUser.username}` };
  };

  /**
   * User Sign-Up with strict Email Match Validation
   */
  const signUp = async (username: string, email: string, password: string, libraryEmail: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanLib = libraryEmail.trim().toLowerCase();

    // Developer Admin reservation
    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        message: 'This email is reserved for system administration.',
      };
    }

    // Mandatory Mail Validation Check
    const matchCheck = validateMatchingEmails(cleanEmail, cleanLib);
    if (!matchCheck.isValid) {
      return { success: false, message: matchCheck.message };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      username: username.trim() || cleanEmail.split('@')[0],
      bookClubEmail: cleanEmail,
      libraryEmail: cleanLib,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      bio: 'Club reader on Books & Friends',
      favoriteGenre: 'Fiction & Poetry',
      role: 'user',
      isDemo: false,
      clubsCount: 1,
      completedBooksCount: 0,
      chaptersReadCount: 0,
      createdAt: new Date().toISOString(),
    };

    setPersonalAccount(newUser);
    setUser(newUser);
    return { success: true, message: 'Account successfully created and validated!' };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  };

  /**
   * Account Switching Restrictions (Specification Section 8.3):
   * When using Switch Reader Account, users are only permitted to switch to Demo accounts.
   * Switching to other users' personal accounts is strictly prohibited. Users may only switch between
   * their own personal account and Demo accounts; other users' accounts cannot be accessed or switched to in this manner.
   */
  const switchProfile = (profileId: string): { success: boolean; message: string } => {
    // 1. Check if target is a permitted Demo account
    const matchedDemo = DEMO_PROFILES.find((p) => p.id === profileId);
    if (matchedDemo) {
      setUser(matchedDemo);
      return {
        success: true,
        message: `Switched to Demo profile: ${matchedDemo.username}`,
      };
    }

    // 2. Check if target is the user's own active personal account
    if (personalAccount && personalAccount.id === profileId) {
      setUser(personalAccount);
      return {
        success: true,
        message: `Returned to your personal account: ${personalAccount.username}`,
      };
    }

    // 3. Admin account protection
    if (profileId === ADMIN_PROFILE.id || profileId === 'admin') {
      return {
        success: false,
        message: 'Security Restriction: Developer Admin requires authentication via Admin Mail and Password.',
      };
    }

    // 4. Strict RBAC Isolation: Cannot switch to other users' personal accounts
    return {
      success: false,
      message: 'Account Switching Restriction: Switching to other users\' personal accounts is strictly prohibited. You may only switch between your personal account and Demo accounts.',
    };
  };

  const updateProfile = (updates: Partial<UserProfile>): boolean => {
    if (!user) return false;

    // Check mail match if both are updated
    const nextClub = updates.bookClubEmail ?? user.bookClubEmail;
    const nextLib = updates.libraryEmail ?? user.libraryEmail;

    const validation = validateMatchingEmails(nextClub, nextLib);
    if (!validation.isValid) {
      return false;
    }

    const updated: UserProfile = {
      ...user,
      ...updates,
      bookClubEmail: nextClub,
      libraryEmail: nextLib,
    };
    setUser(updated);

    // If active user is also the personal account, keep it synced
    if (personalAccount && personalAccount.id === user.id) {
      setPersonalAccount(updated);
    }

    return true;
  };

  const isAdmin = user?.role === 'admin' && user?.bookClubEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isAuthenticated: !!user,
        demoProfiles: DEMO_PROFILES,
        personalAccount,
        validateMatchingEmails,
        signIn,
        signUp,
        signOut,
        switchProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
