import { Employee } from '../types';

interface EmployeeCardProps {
  employee: Employee;
  onClick: () => void;
}

const STATUS_LABEL: Record<Employee['status'], string> = {
  CLOCKED_OUT: 'Clocked Out',
  CLOCKED_IN: 'Clocked In',
  ON_BREAK: 'On Break',
};

const STATUS_CLASS: Record<Employee['status'], string> = {
  CLOCKED_OUT: 'employee-card__status--out',
  CLOCKED_IN: 'employee-card__status--in',
  ON_BREAK: 'employee-card__status--break',
};

export default function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
  return (
    <button type="button" className="employee-card" onClick={onClick}>
      <span className="employee-card__name">
        {employee.firstName} {employee.lastName}
      </span>
      {employee.position && <span className="employee-card__position">{employee.position}</span>}
      <span className={`employee-card__status ${STATUS_CLASS[employee.status]}`}>
        {STATUS_LABEL[employee.status]}
      </span>
    </button>
  );
}
