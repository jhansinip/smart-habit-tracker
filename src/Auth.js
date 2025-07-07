import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Paper, Divider, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
        setIsLogin(true);
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up.');
      } else {
        setError(err.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Paper elevation={6} sx={{ p: 5, width: 370, borderRadius: 4, background: 'rgba(255,255,255,0.95)', position: 'relative' }}>
        <IconButton onClick={() => setHelpOpen(true)} sx={{ position: 'absolute', top: 16, right: 16, color: '#764ba2' }}>
          <HelpOutlineIcon fontSize="large" />
        </IconButton>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#764ba2', fontWeight: 700 }}>
          Smart Habit Tracker
        </Typography>
        <Typography variant="h6" align="center" gutterBottom sx={{ color: '#667eea', fontWeight: 500 }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ background: '#f3f3f3', borderRadius: 1 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ background: '#f3f3f3', borderRadius: 1 }}
          />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', fontWeight: 600, letterSpacing: 1 }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </form>
        <Divider sx={{ my: 2 }}>OR</Divider>
        <Button onClick={handleGoogleSignIn} variant="outlined" fullWidth startIcon={<GoogleIcon />} sx={{ color: '#764ba2', borderColor: '#764ba2', fontWeight: 600, letterSpacing: 1, background: '#f3f3f3' }}>
          Sign in with Google
        </Button>
        <Button color="secondary" fullWidth sx={{ mt: 2, color: '#667eea', fontWeight: 500 }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
        </Button>
        {/* Help Dialog */}
        <Dialog open={helpOpen} onClose={() => setHelpOpen(false)}>
          <DialogTitle>How to Use Smart Habit Tracker</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              <b>Welcome!</b> Here's how to get started:
            </Typography>
            <ul>
              <li>Sign up or log in using your email or Google account.</li>
              <li>Add your daily habits on the dashboard.</li>
              <li>Mark habits as completed each day by checking the box.</li>
              <li>Track your progress with charts and streaks.</li>
              <li>Use the AI suggestion to discover new healthy habits.</li>
              <li>Click your profile to view or edit your details.</li>
              <li>Need more help? Look for the help icon on any page!</li>
            </ul>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHelpOpen(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Auth; 