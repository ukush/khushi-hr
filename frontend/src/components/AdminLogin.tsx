import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminLogin } from '../api';
import Keypad from './Keypad';

const MAX_PIN_LENGTH = 6;

interface AdminLoginProps {
  onSuccess: (token: string) => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: () => adminLogin(pin),
    onSuccess: (data) => {
      setPin('');
      setError(null);
      onSuccess(data.token);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setPin('');
    },
  });

  const handleDigit = (digit: string) => {
    setError(null);
    setPin((prev) => (prev.length < MAX_PIN_LENGTH ? prev + digit : prev));
  };

  const handleDelete = () => {
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <h1 className="admin-login__title">
          Khushi <span>HR</span>
        </h1>
        <p className="admin-login__subtitle">Enter admin PIN</p>

        <label className="modal__field">
          <span className="modal__label">PIN</span>
          <input
            className="modal__input modal__input--pin"
            type="password"
            value={pin}
            readOnly
            placeholder="••••"
          />
        </label>

        {error && <p className="modal__error">{error}</p>}

        <Keypad onDigit={handleDigit} onDelete={handleDelete} />

        <button
          type="button"
          className="btn btn--primary admin-login__submit"
          disabled={pin.length === 0 || loginMutation.isPending}
          onClick={() => loginMutation.mutate()}
        >
          Log In
        </button>
      </div>
    </div>
  );
}
