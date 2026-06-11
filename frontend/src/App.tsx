import { Route, Routes } from 'react-router-dom';
import ClockInPage from './pages/ClockInPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ClockInPage />} />
      <Route path="/admin/*" element={<AdminPage />} />
    </Routes>
  );
}
