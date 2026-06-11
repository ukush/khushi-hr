import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, createAdminUser, updateAdminUser } from '../api';
import { AdminUser, AdminUserInput, UserRole } from '../types';

interface EmployeeFormModalProps {
  token: string;
  user: AdminUser | null;
  onClose: () => void;
}

const PIN_REGEX = /^\d{4,6}$/;

export default function EmployeeFormModal({ token, user, onClose }: EmployeeFormModalProps) {
  const isEdit = user !== null;
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [position, setPosition] = useState(user?.position ?? '');
  const [hourlyRate, setHourlyRate] = useState(user ? String(user.hourlyRate) : '');
  const [role, setRole] = useState<UserRole>(user?.role ?? 'EMPLOYEE');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    queryClient.invalidateQueries({ queryKey: ['timesheet'] });
  };

  const mutation = useMutation({
    mutationFn: () => {
      const rate = Number(hourlyRate);
      const input: AdminUserInput = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        position: position.trim() === '' ? null : position.trim(),
        hourlyRate: rate,
        role,
        ...(pin ? { pin } : {}),
      };

      if (isEdit) {
        return updateAdminUser(user.id, input, token);
      }
      return createAdminUser({ ...input, pin }, token);
    },
    onSuccess: () => {
      invalidate();
      onClose();
    },
    onError: (err: unknown) => {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    },
  });

  const rateValue = Number(hourlyRate);
  const isValid =
    firstName.trim().length > 0 &&
    hourlyRate.trim().length > 0 &&
    !Number.isNaN(rateValue) &&
    rateValue >= 0 &&
    (pin === '' || PIN_REGEX.test(pin)) &&
    (isEdit || PIN_REGEX.test(pin));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className="modal__title">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>

        <div className="modal__row">
          <label className="modal__field">
            <span className="modal__label">First Name</span>
            <input
              className="modal__input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>
          <label className="modal__field">
            <span className="modal__label">Last Name</span>
            <input
              className="modal__input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </label>
        </div>

        <label className="modal__field">
          <span className="modal__label">Position</span>
          <input
            className="modal__input"
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Server, Chef, Manager"
          />
        </label>

        <div className="modal__row">
          <label className="modal__field">
            <span className="modal__label">Hourly Rate</span>
            <input
              className="modal__input"
              type="number"
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </label>
          <label className="modal__field">
            <span className="modal__label">Role</span>
            <select
              className="modal__input modal__select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
        </div>

        <label className="modal__field">
          <span className="modal__label">PIN</span>
          <input
            className="modal__input modal__input--pin"
            type="text"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={isEdit ? 'Leave blank to keep current PIN' : '4-6 digits'}
          />
        </label>

        {error && <p className="modal__error">{error}</p>}

        <div className="modal__actions modal__actions--single">
          <button
            type="button"
            className="btn btn--primary"
            disabled={!isValid || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {isEdit ? 'Save Changes' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}
