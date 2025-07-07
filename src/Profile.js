import React, { useState, useContext, useEffect } from 'react';
import { Box, Typography, Avatar, TextField, Button, Paper, Snackbar, LinearProgress, Dialog, DialogTitle, DialogActions, Switch, FormControlLabel } from '@mui/material';
import { auth, db } from './firebase';
import { updateProfile, deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from './App';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PublicIcon from '@mui/icons-material/Public';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Profile = () => {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [photo, setPhoto] = useState(user.photoURL || '');
  const [photoPreview, setPhotoPreview] = useState(user.photoURL || '');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [city, setCity] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [message, setMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkedinError, setLinkedinError] = useState('');
  const [twitterError, setTwitterError] = useState('');
  const [badges, setBadges] = useState([]);
  const navigate = useNavigate();
  const { mode, setMode } = useContext(ThemeContext);

  const BADGES = [
    { key: 'first_habit', name: 'First Habit', icon: <StarIcon sx={{ color: '#ffd700' }} />, desc: 'Added your first habit!' },
    { key: '7_day_streak', name: '7-Day Streak', icon: <WhatshotIcon sx={{ color: '#ff5722' }} />, desc: 'Completed a 7-day streak!' },
    { key: '30_completions', name: '30 Completions', icon: <EmojiEventsIcon sx={{ color: '#43cea2' }} />, desc: 'Completed habits 30 times!' },
    { key: 'first_share', name: 'First Share', icon: <PublicIcon sx={{ color: '#1fa2ff' }} />, desc: 'Shared a habit!' },
    { key: '100_likes', name: '100 Cheers', icon: <FavoriteIcon sx={{ color: '#e91e63' }} />, desc: 'Received 100 cheers on a habit!' },
  ];

  // Profile completion calculation
  const fields = [displayName, bio, phone, birthday, city, linkedin, twitter, photoPreview];
  const filled = fields.filter(f => f && f.trim() !== '').length;
  const completion = Math.round((filled / fields.length) * 100);

  // Last login time (if available)
  const lastLogin = user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A';

  const handleNameChange = (e) => setDisplayName(e.target.value);
  const handleBioChange = (e) => setBio(e.target.value);
  const handlePhoneChange = (e) => setPhone(e.target.value);
  const handleBirthdayChange = (e) => setBirthday(e.target.value);
  const handleCityChange = (e) => setCity(e.target.value);
  const handleLinkedinChange = (e) => {
    setLinkedin(e.target.value);
    if (e.target.value && !e.target.value.startsWith('https://')) {
      setLinkedinError('LinkedIn must start with https://');
    } else {
      setLinkedinError('');
    }
  };
  const handleTwitterChange = (e) => {
    let value = e.target.value;
    if (value && !value.startsWith('@')) {
      value = '@' + value.replace(/^@+/, '');
    }
    setTwitter(value);
    if (value && !value.startsWith('@')) {
      setTwitterError('Twitter handle must start with @');
    } else {
      setTwitterError('');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
      setPhoto(file);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(user, {
        displayName,
        photoURL: typeof photo === 'string' ? photo : photoPreview,
      });
      // Save custom fields to Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        bio,
        phone,
        birthday,
        city,
        linkedin,
        twitter,
        photo: typeof photo === 'string' ? photo : photoPreview,
      }, { merge: true });
      setMessage('Profile updated!');
      setSnackbarOpen(true);
    } catch (err) {
      setMessage('Error updating profile.');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(user);
      navigate('/auth');
    } catch (err) {
      setMessage('Error deleting account.');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().badges) {
        setBadges(userSnap.data().badges);
      } else {
        setBadges([]);
      }
    };
    fetchBadges();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setBio(data.bio || '');
        setPhone(data.phone || '');
        setBirthday(data.birthday || '');
        setCity(data.city || '');
        setLinkedin(data.linkedin || '');
        setTwitter(data.twitter || '');
        setPhotoPreview(data.photo || user.photoURL || '');
        setPhoto(data.photo || user.photoURL || '');
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ background: mode === 'dark' ? 'linear-gradient(135deg, #232526 0%, #414345 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Paper elevation={6} sx={{ p: 5, width: 370, borderRadius: 4, background: 'rgba(255,255,255,0.95)' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#764ba2', fontWeight: 700 }}>
          Profile
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar src={photoPreview} sx={{ width: 80, height: 80, mb: 2 }} />
          <Button variant="outlined" component="label" sx={{ mb: 2 }}>
            Upload Photo
            <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
          </Button>
        </Box>
        <LinearProgress variant="determinate" value={completion} sx={{ mb: 2, height: 10, borderRadius: 5 }} />
        <Typography align="center" sx={{ mb: 2 }}>
          Profile Completion: {completion}%
        </Typography>
        <Box mb={2}>
          <Typography variant="h6" align="center" sx={{ color: '#764ba2', fontWeight: 700, mb: 1 }}>
            Achievements
          </Typography>
          <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2}>
            {BADGES.map(badge => (
              <Box key={badge.key} display="flex" flexDirection="column" alignItems="center" sx={{ opacity: badges.includes(badge.key) ? 1 : 0.3 }}>
                {badge.icon}
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{badge.name}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <TextField
          label="Display Name"
          value={displayName}
          onChange={handleNameChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Bio / About Me"
          value={bio}
          onChange={handleBioChange}
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Phone Number"
          value={phone}
          onChange={handlePhoneChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Birthday"
          type="date"
          value={birthday}
          onChange={handleBirthdayChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="City"
          value={city}
          onChange={handleCityChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="LinkedIn"
          value={linkedin}
          onChange={handleLinkedinChange}
          fullWidth
          sx={{ mb: 2 }}
          helperText="Optional. Enter your LinkedIn profile URL."
          error={!!linkedinError}
          FormHelperTextProps={{ style: { color: linkedinError ? 'red' : undefined } }}
        />
        <TextField
          label="Twitter"
          value={twitter}
          onChange={handleTwitterChange}
          fullWidth
          sx={{ mb: 2 }}
          helperText="Optional. Enter your Twitter handle (start with @)."
          error={!!twitterError}
          FormHelperTextProps={{ style: { color: twitterError ? 'red' : undefined } }}
        />
        <Typography variant="body2" sx={{ mb: 2 }}>
          Email: {user.email}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Last Login: {lastLogin}
        </Typography>
        {linkedin && !linkedinError && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            LinkedIn: <a href={linkedin} target="_blank" rel="noopener noreferrer">{linkedin}</a>
          </Typography>
        )}
        {twitter && !twitterError && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            Twitter: {twitter}
          </Typography>
        )}
        <FormControlLabel
          control={<Switch checked={mode === 'dark'} onChange={() => setMode(mode === 'dark' ? 'light' : 'dark')} />}
          label="Dark Mode"
          sx={{ mb: 2 }}
        />
        <Button variant="contained" fullWidth sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', fontWeight: 600 }} onClick={handleSave} disabled={!!linkedinError || !!twitterError} aria-label="save profile">
          Save Changes
        </Button>
        <Button fullWidth sx={{ mt: 2, color: '#764ba2', fontWeight: 500 }} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
        <Button fullWidth sx={{ mt: 2, color: 'red', fontWeight: 500 }} onClick={() => setDeleteDialogOpen(true)}>
          Delete Account
        </Button>
        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} message={message} />
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
          <DialogActions>
            <Button onClick={handleDelete} color="error" aria-label="delete account">Yes, Delete</Button>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Profile; 