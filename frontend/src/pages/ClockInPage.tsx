import EmployeeGrid from '../components/EmployeeGrid';

export default function ClockInPage() {
  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">
            Khushi <span>HR</span>
          </h1>
          <p className="app__subtitle">Tap your name to clock in, take a break, or clock out</p>
        </div>
      </header>
      <main className="app__main">
        <EmployeeGrid />
      </main>
    </div>
  );
}
