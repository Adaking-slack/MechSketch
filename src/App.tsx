import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelectRobot from './pages/SelectRobot';
import Planner from './pages/Planner';
import Auth from './pages/Auth';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/select-robot" element={<SelectRobot />} />
        <Route path="/planner" element={<Planner />} />
      </Routes>
    </Router>
  );
}

export default App;
