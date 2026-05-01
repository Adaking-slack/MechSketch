import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import SelectRobot from './pages/SelectRobot';
import SelectObject from './pages/SelectObject';
import Planner from './pages/Planner';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Faq from './pages/Faq';
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
        <Route path="/settings" element={<Settings />} />
        <Route path="/faq" element={<Faq />} />
      </Routes>
    </Router>
  );
}
export default App;
