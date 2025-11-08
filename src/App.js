import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Create from './pages/Create';
import TempGallery from './pages/TempGallery';
import ImageEditor from './pages/ImageEditor';
import Editor from './pages/Editor';
import Gallery from './pages/Gallery';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Messages from './pages/Messages';
import UserProfile from './pages/UserProfile';
import Stories from './pages/Stories';
import CreateStory from './pages/CreateStory';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques (sans Layout) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées (avec Layout et Navbar) */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
        <Route path="/temp-gallery" element={<ProtectedRoute><TempGallery /></ProtectedRoute>} />
        <Route path="/image-editor" element={<ProtectedRoute><ImageEditor /></ProtectedRoute>} />
        <Route path="/editor" element={<ProtectedRoute><Layout><Editor /></Layout></ProtectedRoute>} />
        <Route path="/gallery" element={<ProtectedRoute><Layout><Gallery /></Layout></ProtectedRoute>} />
        <Route path="/feed" element={<ProtectedRoute><Layout><Feed /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Layout><Friends /></Layout></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
        <Route path="/user/:userId" element={<ProtectedRoute><Layout><UserProfile /></Layout></ProtectedRoute>} />
        <Route path="/stories" element={<ProtectedRoute><Layout><Stories /></Layout></ProtectedRoute>} />
        <Route path="/create-story" element={<ProtectedRoute><CreateStory /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;