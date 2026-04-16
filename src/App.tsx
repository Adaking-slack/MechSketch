import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelectRobot from './pages/SelectRobot';
import Planner from './pages/Planner';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectRobot />} />
        <Route path="/planner" element={<Planner />} />
      </Routes>
    </Router>
  );
}

export default App;
