import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import SelectRobot from './pages/SelectRobot';
import SelectObject from './pages/SelectObject';
import Planner from './pages/Planner';
import Auth from './pages/Auth';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/select-robot" element={<SelectRobot />} />
        <Route path="/select-object" element={<SelectObject />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
