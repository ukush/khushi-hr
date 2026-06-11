import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, deleteAdminUser, fetchAdminUsers, updateAdminUser } from '../api';
import { AdminUser } from '../types';
import EmployeeFormModal from './EmployeeFormModal';

interface AdminEmployeesProps {
  token: string;
  onLogout: () => void;
}

function formatRate(rate: number): string {
  return `£${rate.toFixed(2)}/hr`;
}

export default function AdminEmployees({ token, onLogout }: AdminEmployeesProps) {
  const queryClient = useQueryClient();
  const [modalUser, setModalUser] = useState<AdminUser | null | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => fetchAdminUsers(token),
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        onLogout();
      }
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    queryClient.invalidateQueries({ queryKey: ['timesheet'] });
  };

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => updateAdminUser(id, { isActive: true }, token),
    onSuccess: () => {
      setActionError(null);
      invalidate();
    },
    onError: (err: unknown) => {
      setActionError(err instanceof ApiError ? err.message : 'Something went wrong');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteAdminUser(id, token),
    onSuccess: (result) => {
      setActionError(null);
      setStatusMessage(
        result.deleted
          ? 'Employee deleted.'
          : 'Employee has shift history, so they were deactivated instead of deleted.',
      );
      invalidate();
    },
    onError: (err: unknown) => {
      setActionError(err instanceof ApiError ? err.message : 'Something went wrong');
    },
  });

  const handleRemove = (employee: AdminUser) => {
    setStatusMessage(null);
    const confirmed = window.confirm(
      `Remove ${employee.firstName} ${employee.lastName}? Employees with shift history will be deactivated instead of deleted.`,
    );
    if (confirmed) {
      removeMutation.mutate(employee.id);
    }
  };

  return (
    <>
      <div className="admin-dashboard__controls">
        <h2 className="admin-employees__title">Employees</h2>
        <button type="button" className="btn btn--primary" onClick={() => setModalUser(null)}>
          Add Employee
        </button>
      </div>

      {statusMessage && <p className="status-message status-message--success">{statusMessage}</p>}
      {actionError && <p className="status-message status-message--error">{actionError}</p>}

      {isLoading && <p className="status-message">Loading employees…</p>}
      {isError && <p className="status-message status-message--error">Could not load employees.</p>}

      {data && (
        <div className="timesheet-table-wrapper">
          <table className="timesheet-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Hourly Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="timesheet-table__name">
                      {employee.firstName} {employee.lastName}
                    </div>
                    {employee.position && (
                      <div className="timesheet-table__position">{employee.position}</div>
                    )}
                  </td>
                  <td>{employee.role === 'ADMIN' ? 'Admin' : 'Employee'}</td>
                  <td>{formatRate(employee.hourlyRate)}</td>
                  <td>
                    <span
                      className={`badge ${
                        employee.isActive ? 'badge--active' : 'badge--inactive'
                      }`}
                    >
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-employees__actions">
                      <button
                        type="button"
                        className="btn btn--gold"
                        onClick={() => setModalUser(employee)}
                      >
                        Edit
                      </button>
                      {employee.isActive ? (
                        <button
                          type="button"
                          className="btn btn--dark"
                          disabled={removeMutation.isPending}
                          onClick={() => handleRemove(employee)}
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn--dark"
                          disabled={reactivateMutation.isPending}
                          onClick={() => reactivateMutation.mutate(employee.id)}
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalUser !== undefined && (
        <EmployeeFormModal token={token} user={modalUser} onClose={() => setModalUser(undefined)} />
      )}
    </>
  );
}
