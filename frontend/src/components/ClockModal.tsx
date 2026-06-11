import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clockIn, clockOut, toggleBreak } from '../api';
import { Employee } from '../types';
import Keypad from './Keypad';

interface ClockModalProps {
  employee: Employee;
  onClose: () => void;
}

const MAX_PIN_LENGTH = 6;

export default function ClockModal({ employee, onClose }: ClockModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    setPin('');
    setError(null);
    onClose();
  };

  const handleError = (err: unknown) => {
    setError(err instanceof Error ? err.message : 'Something went wrong');
    setPin('');
  };

  const clockInMutation = useMutation({
    mutationFn: () => clockIn(employee.id, pin),
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const clockOutMutation = useMutation({
    mutationFn: () => clockOut(employee.id, pin),
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const breakMutation = useMutation({
    mutationFn: () => toggleBreak(employee.id, pin),
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const isPending =
    clockInMutation.isPending || clockOutMutation.isPending || breakMutation.isPending;

  const handleDigit = (digit: string) => {
    setError(null);
    setPin((prev) => (prev.length < MAX_PIN_LENGTH ? prev + digit : prev));
  };

  const handleDelete = () => {
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const breakLabel = employee.status === 'ON_BREAK' ? 'End Break' : 'Take Break';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className="modal__title">{employee.firstName} {employee.lastName}</h2>

        <label className="modal__field">
          <span className="modal__label">Employee</span>
          <input
            className="modal__input"
            type="text"
            value={`${employee.firstName} ${employee.lastName}`}
            readOnly
          />
        </label>

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

        <div className="modal__actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled={employee.status !== 'CLOCKED_OUT' || pin.length === 0 || isPending}
            onClick={() => clockInMutation.mutate()}
          >
            Clock In
          </button>
          <button
            type="button"
            className="btn btn--gold"
            disabled={employee.status === 'CLOCKED_OUT' || pin.length === 0 || isPending}
            onClick={() => breakMutation.mutate()}
          >
            {breakLabel}
          </button>
          <button
            type="button"
            className="btn btn--dark"
            disabled={employee.status === 'CLOCKED_OUT' || pin.length === 0 || isPending}
            onClick={() => clockOutMutation.mutate()}
          >
            Clock Out
          </button>
        </div>
      </div>
    </div>
  );
}
