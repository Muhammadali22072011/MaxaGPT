import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { RegistrationPage } from './RegistrationPage';

export const AuthPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-default)] text-[var(--text-primary)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-[var(--bg-card)] rounded-lg shadow-lg">
          <div className="flex justify-center border-b border-[var(--bg-default)] mb-6">
              <button 
                  onClick={() => setShowLogin(true)}
                  className={`px-6 py-2 text-lg font-semibold transition-colors ${showLogin ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
              >
                  Login
              </button>
              <button 
                  onClick={() => setShowLogin(false)}
                   className={`px-6 py-2 text-lg font-semibold transition-colors ${!showLogin ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
              >
                  Register
              </button>
          </div>

        {showLogin ? (
            <LoginPage onSwitchToRegister={() => setShowLogin(false)} />
        ) : (
            <RegistrationPage onSwitchToLogin={() => setShowLogin(true)} />
        )}
      </div>
    </div>
  );
};
