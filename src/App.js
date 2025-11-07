import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Create from './pages/Create';
import TempGallery from './pages/TempGallery';
import Editor from './pages/Editor';
import Gallery from './pages/Gallery';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Messages from './pages/Messages';
import UserProfile from './pages/UserProfile';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques (sans Layout) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées (avec Layout et Navbar) */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/create" element={<Create />} />
        <Route path="/temp-gallery" element={<TempGallery />} />
        <Route path="/editor" element={<Layout><Editor /></Layout>} />
        <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
        <Route path="/feed" element={<Layout><Feed /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/friends" element={<Layout><Friends /></Layout>} />
        <Route path="/messages" element={<Layout><Messages /></Layout>} />
        <Route path="/user/:userId" element={<Layout><UserProfile /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;