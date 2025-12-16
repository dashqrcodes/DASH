'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient, normalizePhoneNumber } from '@/lib/utils/supabase-client';

interface PhoneOTPProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function PhoneOTP({ onSuccess, redirectTo = '/' }: PhoneOTPProps) {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const normalized = normalizePhoneNumber(phone);
      setNormalizedPhone(normalized);

      // Send OTP via Supabase Auth (client-side)
      const { data, error: sendError } = await supabaseClient.auth.signInWithOtp({
        phone: normalized,
        options: {
          channel: 'sms',
        },
      });

      if (sendError) {
        // Log in dev only
        if (process.env.NODE_ENV === 'development') {
          console.error('[OTP Send Error]', sendError);
        }

        let userMessage = 'Failed to send verification code';
        if (sendError.message.includes('rate limit') || sendError.status === 429) {
          userMessage = 'Too many requests. Please wait a moment and try again.';
          setResendCooldown(60);
        } else if (sendError.message.includes('invalid')) {
          userMessage = 'Invalid phone number. Please check and try again.';
        } else if (sendError.message.includes('disabled')) {
          userMessage = 'Phone authentication is temporarily disabled.';
        }

        setError(userMessage);
        setLoading(false);
        return;
      }

      // Log success in dev only
      if (process.env.NODE_ENV === 'development') {
        console.log('[OTP Send Success]', { phone: normalized });
      }

      setStep('verify');
      setResendCooldown(60); // 60 second cooldown
      setLoading(false);
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[OTP Send Exception]', err);
      }
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5 && newOtp.every(d => d !== '')) {
      handleOtpSubmit(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    
    setOtp(newOtp);
    
    if (pasted.length === 6) {
      handleOtpSubmit(pasted);
    } else {
      otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleOtpSubmit = async (code?: string) => {
    const codeToVerify = code || otp.join('');
    
    if (codeToVerify.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Verify OTP via Supabase Auth (client-side)
      const { data, error: verifyError } = await supabaseClient.auth.verifyOtp({
        phone: normalizedPhone,
        token: codeToVerify,
        type: 'sms',
      });

      if (verifyError) {
        // Log in dev only
        if (process.env.NODE_ENV === 'development') {
          console.error('[OTP Verify Error]', verifyError);
        }

        let userMessage = 'Verification failed';
        if (verifyError.message.includes('expired') || verifyError.message.includes('invalid')) {
          userMessage = 'Verification code is invalid or has expired. Please request a new code.';
        } else if (verifyError.message.includes('rate limit') || verifyError.status === 429) {
          userMessage = 'Too many attempts. Please wait a moment and try again.';
        } else if (verifyError.message.includes('token')) {
          userMessage = 'Invalid verification code. Please check and try again.';
        }

        setError(userMessage);
        setLoading(false);
        return;
      }

      // Log success in dev only
      if (process.env.NODE_ENV === 'development') {
        console.log('[OTP Verify Success]', {
          userId: data?.user?.id,
          session: data?.session ? 'created' : 'none',
        });
      }

      // Session is automatically stored by Supabase client
      // Redirect or call success callback
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[OTP Verify Exception]', err);
      }
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setError(null);
    setLoading(true);

    try {
      const { error: sendError } = await supabaseClient.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          channel: 'sms',
        },
      });

      if (sendError) {
        setError('Failed to resend code. Please try again.');
        setLoading(false);
        return;
      }

      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setLoading(false);
      // Focus first OTP input
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      setLoading(false);
    }
  };

  if (step === 'phone') {
    return (
      <div className="max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Enter Your Phone Number</h2>
        <form onSubmit={handlePhoneSubmit}>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError(null);
              }}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !phone}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Enter Verification Code</h2>
      <p className="text-sm text-gray-600 mb-6">
        We sent a 6-digit code to {normalizedPhone}
      </p>
      
      <form onSubmit={(e) => { e.preventDefault(); handleOtpSubmit(); }}>
        <div className="flex gap-2 justify-center mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                otpInputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={index === 0 ? handleOtpPaste : undefined}
              className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || otp.some(d => !d)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : 'Resend code'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setOtp(['', '', '', '', '', '']);
              setError(null);
            }}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Change phone number
          </button>
        </div>
      </form>
    </div>
  );
}

