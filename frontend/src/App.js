import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Autorization from './pages/Autorization';
import Registration from './pages/Registration';


function App() {
  return (
        <Router>  
        <Routes>
          <Route path="/messenger-frontend/home" element={<Home />} />
          <Route path="/messenger-frontend/" element={<Registration />} />
          <Route path="/messenger-frontend/autorization" element={<Autorization />} />
        </Routes>
      </Router>
    );
}

export default App;