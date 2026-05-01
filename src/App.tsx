import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateProgram from './pages/CreateProgram';
import ProgramDetail from './pages/ProgramDetail';
import SubmitReport from './pages/SubmitReport';
import ReportDetail from './pages/ReportDetail';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/programs/new" element={<CreateProgram />} />
        <Route path="/programs/:id" element={<ProgramDetail />} />
        <Route path="/programs/:id/report" element={<SubmitReport />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
