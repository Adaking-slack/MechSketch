import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelectRobot from './pages/SelectRobot';
import Planner from './pages/Planner';
import Auth from './pages/Auth';
import Home from './pages/Home';
import { RobotActionProvider } from './context/RobotActionContext';
import './App.css';

function App() {
  return (
    <RobotActionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/select-robot" element={<SelectRobot />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
    </RobotActionProvider>
  );
}

export default App;
