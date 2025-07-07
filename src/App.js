import React, { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Dashboard from './Dashboard';
import Profile from './Profile';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, createContext } from 'react';
import SharedHabit from './SharedHabit';
import SocialFeed from './SocialFeed';
import Insights from './Insights';

const NotFound = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column' }}>
    <h1>404 - Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  </div>
);

export const ThemeContext = createContext();

function App() {
  const [mode, setMode] = useState('light');
  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#667eea' },
      secondary: { main: '#764ba2' },
    },
  });
  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/shared/:habitId" element={<SharedHabit />} />
            <Route path="/feed" element={<SocialFeed />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
