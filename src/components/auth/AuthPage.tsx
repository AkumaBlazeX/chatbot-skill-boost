
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-brand-50 to-brand-100">
      <div className="w-full max-w-lg text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-800 mb-2">SkillBoost</h1>
        <p className="text-gray-600">Improve your skills through conversational learning</p>
      </div>
      
      {isLogin ? (
        <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
      ) : (
        <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
};

export default AuthPage;
