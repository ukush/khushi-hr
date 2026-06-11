import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEmployees } from '../api';
import { Employee } from '../types';
import EmployeeCard from './EmployeeCard';
import ClockModal from './ClockModal';

export default function EmployeeGrid() {
  const [selected, setSelected] = useState<Employee | null>(null);

  const { data: employees, isLoading, isError } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <p className="status-message">Loading employees…</p>;
  }

  if (isError || !employees) {
    return <p className="status-message status-message--error">Could not load employees.</p>;
  }

  return (
    <>
      <div className="employee-grid">
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onClick={() => setSelected(employee)}
          />
        ))}
      </div>

      {selected && (
        <ClockModal
          employee={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
