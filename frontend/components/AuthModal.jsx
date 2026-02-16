"use client";

import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabaseClient";

export default function AuthModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otpCode,
          password: formData.password,
          fullName: formData.name
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Verification failed');

      setSuccess("Account verified! You can now sign in.");
      setTimeout(() => {
        setIsVerifying(false);
        setIsLogin(true);
        setOtpCode("");
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        setSuccess("Successfully signed in!");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });

        const result = await response.json();

        if (!response.ok) {
          // If we have an OTP in the response during dev, we can still use it for manual testing
          if (result.otp) {
            console.log("INTERNAL DEV OTP:", result.otp);
          }
          throw new Error(result.error || 'Failed to send OTP');
        }

        setSuccess("A verification code has been sent to your email.");
        setIsVerifying(true);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setIsVerifying(false);
    setError("");
    setSuccess("");
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className={`relative ${currentTheme.colors.surface} backdrop-blur-xl rounded-2xl shadow-2xl border ${currentTheme.colors.border} p-8 w-full max-w-md mx-4`}>
        <button onClick={onClose} className={`absolute top-4 right-4 ${currentTheme.colors.textSecondary} ${currentTheme.colors.hover} transition-colors`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className={`text-xl font-bold ${currentTheme.colors.text} mb-2`}>
            {isVerifying ? t('verifyEmail') : isLogin ? t('welcomeBack') : t('createAccount')}
          </h2>
          <p className={`${currentTheme.colors.textSecondary} text-sm`}>
            {isVerifying ? `${t('enterCode')} ${formData.email}` : isLogin ? t('signInAccount') : t('joinNirvana')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={isVerifying ? handleVerifyOtp : handleSubmit} className="space-y-6">
          {isVerifying && (
            <div className="space-y-2">
              <label className={`block text-xs font-medium ${currentTheme.colors.text}`}>{t('verificationCode')}</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder={t('enter6DigitCode')}
                className={`w-full px-3 py-2 ${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text} placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm`}
                required
              />
              <button type="button" onClick={() => setIsVerifying(false)} className={`text-xs ${currentTheme.colors.textSecondary} hover:underline`}>{t('backToSignup')}</button>
            </div>
          )}

          {!isVerifying && (
            <>
              {!isLogin && (
                <div className="space-y-2">
                  <label className={`block text-xs font-medium ${currentTheme.colors.text}`}>{t('fullNameLabel')} *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('enterFullName')}
                    className={`w-full px-3 py-2 ${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text} placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm`}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className={`block text-xs font-medium ${currentTheme.colors.text}`}>{t('emailAddressLabel')} *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('enterEmail')}
                  className={`w-full px-3 py-2 ${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text} placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm`}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-xs font-medium ${currentTheme.colors.text}`}>{t('passwordLabel')} *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t('enterPassword')}
                  className={`w-full px-3 py-2 ${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text} placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm`}
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className={`block text-xs font-medium ${currentTheme.colors.text}`}>{t('confirmPasswordLabel')} *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder={t('confirmPasswordLabel')}
                    className={`w-full px-3 py-2 ${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text} placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm`}
                    required={!isLogin}
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r ${currentTheme.colors.primary} hover:opacity-80 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm disabled:cursor-not-allowed`}
          >
            {isLoading ? t('processing') : isVerifying ? t('verifyCodeAction') : isLogin ? t('signInAction') : t('createAccount')}
          </button>

          {!isVerifying && (
            <div className="text-center">
              <p className={`${currentTheme.colors.textSecondary} text-xs`}>
                {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
                <button type="button" onClick={switchMode} className={`ml-2 bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent hover:opacity-80 font-medium transition-colors text-xs`}>
                  {isLogin ? t('signUpAction') : t('signInAction')}
                </button>
              </p>
            </div>
          )}

          {!isVerifying && (
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${currentTheme.colors.border}`}></div></div>
                <div className="relative flex justify-center text-xs"><span className={`px-2 bg-transparent ${currentTheme.colors.textSecondary}`}>{t('orContinueWith')}</span></div>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 w-full px-3 py-2 ${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text} hover:opacity-80 transition-opacity text-sm`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
