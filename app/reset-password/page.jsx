'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Extract token from URL
  const token = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/signin'), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  if (success) {
    return <div>Password reset successful. Redirecting to login...</div>;
  }

  return (
    <div>
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}
