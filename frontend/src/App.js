import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Autorization from './pages/Autorization';
import Registration from './pages/Registration';


function App() {
  return (
        <Router>  
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Registration />} />
          <Route path="/autorization" element={<Autorization />} />
        </Routes>
      </Router>
    );
}

export default App;