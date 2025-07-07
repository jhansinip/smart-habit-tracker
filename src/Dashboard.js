import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, TextField, Button, List, ListItem, ListItemText, Checkbox, Paper, Avatar, Card, CardContent, CardActions, Dialog, DialogTitle, DialogActions, MenuItem, Select, InputLabel, FormControl, Tooltip } from '@mui/material';
import { db, auth } from './firebase';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import Confetti from 'react-confetti';
import CircularProgress from '@mui/material/CircularProgress';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Snackbar from '@mui/material/Snackbar';
import BarChartIcon from '@mui/icons-material/BarChart';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';

const BADGES = [
  { key: 'first_habit', name: 'First Habit', icon: <span role="img" aria-label="star">⭐</span>, desc: 'Added your first habit!' },
  { key: '7_day_streak', name: '7-Day Streak', icon: <span role="img" aria-label="fire">🔥</span>, desc: 'Completed a 7-day streak!' },
  { key: '30_completions', name: '30 Completions', icon: <span role="img" aria-label="trophy">🏆</span>, desc: 'Completed habits 30 times!' },
  { key: 'first_share', name: 'First Share', icon: <span role="img" aria-label="globe">🌐</span>, desc: 'Shared a habit!' },
  { key: '100_likes', name: '100 Cheers', icon: <span role="img" aria-label="heart">💖</span>, desc: 'Received 100 cheers on a habit!' },
  { key: 'hardcore', name: 'Hardcore', icon: <span role="img" aria-label="hard">💪</span>, desc: 'Completed 10+ Hard habits!' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  // All hooks must be called before any early return
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [habit, setHabit] = useState('');
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [habitCategory, setHabitCategory] = useState('Health');
  const [habitColor, setHabitColor] = useState('#43cea2');
  const [freezeUsed, setFreezeUsed] = useState(false);
  const [calendarDate, setCalendarDate] = useState(dayjs());
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderFrequency, setReminderFrequency] = useState('daily');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [habitDifficulty, setHabitDifficulty] = useState('Easy');
  const [badges, setBadges] = useState([]);

  const unlockBadge = useCallback(async (badgeKey) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    let badges = [];
    if (userSnap.exists() && userSnap.data().badges) {
      badges = userSnap.data().badges;
    }
    if (!badges.includes(badgeKey)) {
      badges.push(badgeKey);
      await setDoc(userRef, { badges }, { merge: true });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [user]);

  // All useEffect hooks must also be before any early return
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'habits'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const habitsArr = [];
      querySnapshot.forEach((doc) => {
        habitsArr.push({ id: doc.id, ...doc.data() });
      });
      setHabits(habitsArr);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, navigate]);

  useEffect(() => {
    if (habits.length > 0 && habits.every(h => h.completedDates && h.completedDates.includes(new Date().toISOString().split('T')[0]))) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [habits]);

  useEffect(() => {
    if (Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    // Clear previous timers
    window.__habitNotificationTimers = window.__habitNotificationTimers || [];
    window.__habitNotificationTimers.forEach(clearTimeout);
    window.__habitNotificationTimers = [];
    habits.forEach(habit => {
      if (!habit.reminderTime || habit.reminderFrequency === 'none') return;
      // Calculate next notification time
      const [hours, minutes] = habit.reminderTime.split(':').map(Number);
      const now = new Date();
      let next = new Date();
      next.setHours(hours, minutes, 0, 0);
      if (next < now) {
        if (habit.reminderFrequency === 'daily') next.setDate(next.getDate() + 1);
        if (habit.reminderFrequency === 'weekly') next.setDate(next.getDate() + 7);
      }
      const msUntil = next - now;
      if (msUntil > 0) {
        const timer = setTimeout(() => {
          new Notification(`Time for your ${habit.name} habit!`, {
            body: `Don't forget to complete your '${habit.name}' habit!`,
            icon: '/favicon.ico',
          });
        }, msUntil);
        window.__habitNotificationTimers.push(timer);
      }
    });
  }, [habits]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (habits.some(h => (h.likes || 0) >= 100)) unlockBadge('100_likes');
  }, [habits, unlockBadge]);

  // Calculate completions by difficulty
  const completionsByDifficulty = {
    Easy: 0,
    Medium: 0,
    Hard: 0
  };
  habits.forEach(h => {
    if (h.difficulty && h.completedDates) {
      completionsByDifficulty[h.difficulty] += h.completedDates.length;
    }
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (completionsByDifficulty.Hard >= 10) unlockBadge('hardcore');
  }, [habits, completionsByDifficulty.Hard, unlockBadge]);

  useEffect(() => {
    if (!user) return;
    const fetchBadges = async () => {
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

  // Ensure all earned badges are awarded if missed previously
  useEffect(() => {
    if (!user || loading) return;
    // First Habit
    if (habits.length > 0 && !badges.includes('first_habit')) {
      unlockBadge('first_habit');
    }
    // 30 Completions
    const totalCompletions = habits.reduce((sum, h) => sum + (h.completedDates ? h.completedDates.length : 0), 0);
    if (totalCompletions >= 30 && !badges.includes('30_completions')) {
      unlockBadge('30_completions');
    }
    // 7-Day Streak
    const currentStreak = Math.max(0, ...habits.map(h => {
      if (!h.completedDates || h.completedDates.length === 0) return 0;
      const sorted = [...h.completedDates].sort((a, b) => new Date(b) - new Date(a));
      let streak = 0;
      let current = new Date();
      for (let i = 0; i < sorted.length; i++) {
        const date = new Date(sorted[i]);
        if (date.toISOString().split('T')[0] === current.toISOString().split('T')[0]) {
          streak++;
          current.setDate(current.getDate() - 1);
        } else {
          break;
        }
      }
      return streak;
    }));
    if (currentStreak >= 7 && !badges.includes('7_day_streak')) {
      unlockBadge('7_day_streak');
    }
    // 100 Cheers
    if (habits.some(h => (h.likes || 0) >= 100) && !badges.includes('100_likes')) {
      unlockBadge('100_likes');
    }
    // Hardcore (10+ Hard completions)
    const hardCompletions = habits.filter(h => h.difficulty === 'Hard' && h.completedDates).reduce((sum, h) => sum + h.completedDates.length, 0);
    if (hardCompletions >= 10 && !badges.includes('hardcore')) {
      unlockBadge('hardcore');
    }
    // First Share (optional: if you want to check for shared habits)
    // if (sharedHabits.length > 0 && !badges.includes('first_share')) {
    //   unlockBadge('first_share');
    // }
  }, [habits, badges, unlockBadge, loading, user]);

  // Now do the early return
  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!habit.trim()) return;
    await addDoc(collection(db, 'habits'), {
      name: habit,
      completedDates: [],
      uid: user.uid,
      category: habitCategory,
      color: habitColor,
      reminderTime,
      reminderFrequency,
      difficulty: habitDifficulty
    });
    if (habits.length === 0) unlockBadge('first_habit');
    setHabit('');
  };

  const handleToggleComplete = async (habitObj) => {
    const today = new Date().toISOString().split('T')[0];
    const completedDates = habitObj.completedDates || [];
    const alreadyCompleted = completedDates.includes(today);
    const newCompletedDates = alreadyCompleted
      ? completedDates.filter((date) => date !== today)
      : [...completedDates, today];
    await updateDoc(doc(db, 'habits', habitObj.id), {
      completedDates: newCompletedDates,
    });
    const totalCompletions = habits.reduce((sum, h) => sum + (h.completedDates ? h.completedDates.length : 0), 0);
    if (totalCompletions >= 30) unlockBadge('30_completions');
    if (getCurrentStreak() >= 7) unlockBadge('7_day_streak');
  };

  const handleDeleteHabit = async (habitId) => {
    await deleteDoc(doc(db, 'habits', habitId));
  };

  const handleLogout = async () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    await signOut(auth);
    window.location.href = '/auth';
  };

  // Helper to calculate streak
  const getStreak = (dates) => {
    if (!dates || dates.length === 0) return 0;
    const sorted = [...dates].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let current = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const date = new Date(sorted[i]);
      if (
        date.toISOString().split('T')[0] ===
        current.toISOString().split('T')[0]
      ) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // AI habit suggestions (simple rules-based)
  const SUGGESTIONS = [
    'Drink 8 glasses of water',
    'Read for 15 minutes',
    'Take a 10-minute walk',
    'Meditate for 5 minutes',
    'Write a daily journal',
    'Plan tomorrow\'s tasks',
    'Practice gratitude',
    'Stretch in the morning',
    'No sugar day',
    'Compliment someone'
  ];
  const userHabits = habits.map(h => h.name.toLowerCase());
  const aiSuggestion = habits.length < 3
    ? SUGGESTIONS.find(s => !userHabits.includes(s.toLowerCase()))
    : null;
  const handleAddSuggestion = async () => {
    if (!aiSuggestion) return;
    await addDoc(collection(db, 'habits'), {
      name: aiSuggestion,
      completedDates: [],
      uid: user.uid,
    });
  };

  // Motivational Quotes
  const QUOTES = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "Don't watch the clock; do what it does. Keep going.",
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it's done.",
    "Small habits make a big difference.",
    "You don't have to be great to start, but you have to start to be great.",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "Discipline is choosing between what you want now and what you want most.",
    "Every day is a chance to get better.",
    "Push yourself, because no one else is going to do it for you."
  ];
  // Pick a quote based on the day
  const todayIdx = new Date().getDate() % QUOTES.length;
  const todayQuote = QUOTES[todayIdx];

  // Add summary calculation helpers
  const getTodayCompleted = () => habits.filter(h => h.completedDates && h.completedDates.includes(new Date().toISOString().split('T')[0])).length;
  const getBestStreak = () => Math.max(0, ...habits.map(h => getStreak(h.completedDates)));
  const getWeeklyCompleted = () => {
    const week = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    return habits.reduce((sum, h) => sum + (h.completedDates ? h.completedDates.filter(d => week.includes(d)).length : 0), 0);
  };

  // Helper to get current streak for all habits
  const getCurrentStreak = () => Math.max(0, ...habits.map(h => {
    if (!h.completedDates || h.completedDates.length === 0) return 0;
    const sorted = [...h.completedDates].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let current = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const date = new Date(sorted[i]);
      if (date.toISOString().split('T')[0] === current.toISOString().split('T')[0]) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }));

  // Helper to get most consistent habit
  const getMostConsistentHabit = () => {
    if (habits.length === 0) return null;
    let maxRate = 0;
    let bestHabit = null;
    habits.forEach(h => {
      const totalDays = h.completedDates ? h.completedDates.length : 0;
      if (totalDays > maxRate) {
        maxRate = totalDays;
        bestHabit = h.name;
      }
    });
    return bestHabit;
  };

  // Helper to get missed days this week
  const getMissedDays = () => {
    const week = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    let missed = 0;
    habits.forEach(h => {
      week.forEach(day => {
        if (!h.completedDates || !h.completedDates.includes(day)) missed++;
      });
    });
    return missed;
  };

  // Weekly progress data for chart
  const weeklyProgressData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    return {
      day: dateStr.slice(5),
      Completed: habits.reduce((sum, h) => sum + (h.completedDates && h.completedDates.includes(dateStr) ? 1 : 0), 0)
    };
  });

  // Motivational message
  const currentStreak = getCurrentStreak();
  const bestStreak = getBestStreak();
  let motivation = '';
  if (currentStreak >= 7) motivation = `Amazing! You're on a ${currentStreak}-day streak!`;
  else if (currentStreak >= 3) motivation = `Great job! Keep your ${currentStreak}-day streak going!`;
  else if (getTodayCompleted() > 0) motivation = `Good start! Complete more habits today!`;
  else motivation = `Let's build some new habits today!`;

  // Categories and colors
  const CATEGORIES = [
    { label: 'Health', color: '#43cea2' },
    { label: 'Study', color: '#667eea' },
    { label: 'Work', color: '#ffd200' },
    { label: 'Personal', color: '#f7971e' },
    { label: 'Other', color: '#888' }
  ];

  // Streak freeze
  const handleFreezeStreak = () => {
    setFreezeUsed(true);
  };

  // Export to CSV
  const exportToCSV = () => {
    const rows = habits.map(h => ({
      name: h.name,
      category: h.category || '',
      color: h.color || '',
      completedDates: (h.completedDates || []).join(';')
    }));
    const header = 'Name,Category,Color,CompletedDates\n';
    const csv = header + rows.map(r => `${r.name},${r.category},${r.color},${r.completedDates}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habits.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Personalized motivational quote
  const personalizedQuotes = [
    streak => streak >= 7 ? 'You are unstoppable! Keep your streak alive!' : null,
    streak => streak >= 3 ? 'Consistency is key. Great job!' : null,
    streak => streak === 0 ? 'Every day is a new chance to start a habit!' : null,
    () => 'Small steps every day lead to big results.'
  ];
  const getPersonalizedQuote = () => {
    for (const fn of personalizedQuotes) {
      const msg = fn(currentStreak);
      if (msg) return msg;
    }
    return personalizedQuotes[personalizedQuotes.length - 1]();
  };

  // Calendar view state
  const completedOnDate = date => habits.filter(h => h.completedDates && h.completedDates.includes(date.format('YYYY-MM-DD'))).map(h => h.name);

  const handleShareHabit = (habit) => {
    // Generate a public link (for now, just a placeholder with habit ID)
    const url = `${window.location.origin}/shared/${habit.id}`;
    navigator.clipboard.writeText(url);
    setSnackbarMsg('Habit link copied! Share it with your friends.');
    setSnackbarOpen(true);
    unlockBadge('first_share');
  };

  return (
    <Box minHeight="100vh" sx={{
      width: '100vw',
      p: { xs: 1, md: 3 },
      background: 'linear-gradient(120deg, #ff5f6d 0%, #ffc371 20%, #47cf73 40%, #1fa2ff 60%, #a259c4 80%, #ff5f6d 100%)',
      backgroundAttachment: 'fixed',
    }}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={300} recycle={false} />}
      <Grid container columns={2} columnSpacing={3} justifyContent="center" alignItems="flex-start">
        {/* Column 1 */}
        <Grid gridColumn="span 1">
          {/* Profile Card */}
          <Card sx={{ mb: 3, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#fff', color: '#764ba2', width: 56, height: 56 }}>
                {(user.displayName ? user.displayName[0] : (user.email ? user.email[0] : '?'))}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.displayName || 'User'}</Typography>
                <Typography variant="body2">{user.email || ''}</Typography>
              </Box>
            </CardContent>
            <CardActions>
              <Button onClick={handleLogout} sx={{ color: '#fff', fontWeight: 600 }} aria-label="logout">Logout</Button>
              <Button onClick={() => navigate('/profile')} sx={{ color: '#fff', fontWeight: 600 }} aria-label="edit profile">Edit Profile</Button>
            </CardActions>
          </Card>
          {/* AI Suggestion */}
          {aiSuggestion && (
            <Paper elevation={4} sx={{ mb: 3, p: 2, background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)', color: '#333', borderRadius: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                AI Suggestion:
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>{aiSuggestion}</Typography>
              <Button variant="contained" sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', fontWeight: 600 }} onClick={handleAddSuggestion}>
                Add Habit
              </Button>
            </Paper>
          )}
          {/* Add Habit Form */}
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
              Smart Habit Tracker
            </Typography>
            <form onSubmit={handleAddHabit} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <TextField label="New Habit" value={habit} onChange={(e) => setHabit(e.target.value)} fullWidth sx={{ flex: '1 1 100%' }} />
              <FormControl sx={{ minWidth: 120, mr: 1 }}><InputLabel>Category</InputLabel><Select value={habitCategory} label="Category" onChange={e => { setHabitCategory(e.target.value); const cat = CATEGORIES.find(c => c.label === e.target.value); setHabitColor(cat ? cat.color : '#888'); }}>{CATEGORIES.map(c => (<MenuItem key={c.label} value={c.label}>{c.label}</MenuItem>))}</Select></FormControl>
              <FormControl sx={{ minWidth: 100 }}><InputLabel>Color</InputLabel><Select value={habitColor} label="Color" onChange={e => setHabitColor(e.target.value)} sx={{ background: habitColor, color: '#fff' }}>{CATEGORIES.map(c => (<MenuItem key={c.color} value={c.color} style={{ background: c.color, color: '#fff' }}>{c.label}</MenuItem>))}</Select></FormControl>
              <FormControl sx={{ minWidth: 120, mr: 1 }}><InputLabel>Reminder</InputLabel><Select value={reminderFrequency} label="Reminder" onChange={e => setReminderFrequency(e.target.value)}><MenuItem value="daily">Daily</MenuItem><MenuItem value="weekly">Weekly</MenuItem><MenuItem value="none">None</MenuItem></Select></FormControl>
              <TextField label="Time" type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} sx={{ minWidth: 120 }} InputLabelProps={{ shrink: true }} inputProps={{ step: 300 }} />
              <FormControl sx={{ minWidth: 120, mr: 1 }}><InputLabel>Difficulty</InputLabel><Select value={habitDifficulty} label="Difficulty" onChange={e => setHabitDifficulty(e.target.value)}><MenuItem value="Easy">Easy</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="Hard">Hard</MenuItem></Select></FormControl>
              <Button type="submit" variant="contained" color="primary" aria-label="add habit">Add</Button>
            </form>
            <Typography variant="h6" gutterBottom>Your Habits</Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px"><CircularProgress color="secondary" /></Box>
            ) : (
              <List>
                {habits.map((h) => {
                  const today = new Date().toISOString().split('T')[0];
                  const completed = h.completedDates && h.completedDates.includes(today);
                  const chartData = Array.from({ length: 7 }).map((_, i) => { const date = new Date(); date.setDate(date.getDate() - (6 - i)); const dateStr = date.toISOString().split('T')[0]; return { date: dateStr.slice(5), Completed: h.completedDates && h.completedDates.includes(dateStr) ? 1 : 0, }; });
                  const streak = getStreak(h.completedDates);
                  return (
                    <ListItem key={h.id} alignItems="flex-start" secondaryAction={
                      <><Checkbox edge="end" checked={completed} onChange={() => handleToggleComplete(h)} /><Button variant="outlined" color="error" size="small" onClick={() => handleDeleteHabit(h.id)} sx={{ ml: 1 }} aria-label="delete habit"><DeleteIcon /></Button><Button variant="outlined" color="primary" size="small" onClick={() => handleShareHabit(h)} sx={{ ml: 1 }} startIcon={<ContentCopyIcon />} aria-label="share habit">Share</Button></>
                    }>
                      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems="center" width="100%">
                        <Box flex={1}><ListItemText primary={<span style={{ fontWeight: 600, color: '#764ba2' }}>{h.name}</span>} secondary={<><span style={{ color: completed ? '#667eea' : '#888' }}>{completed ? 'Completed today' : ''}</span><br/><span style={{ color: '#333', fontWeight: 500 }}>Streak: {streak} days</span></>} /></Box>
                        <Box flex={1}><ResponsiveContainer width="100%" height={40}><BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" hide /><YAxis hide domain={[0, 1]} /><Tooltip /><Bar dataKey="Completed" fill="#667eea" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Box>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
          {/* Motivational Quote */}
          <Paper elevation={2} sx={{ mb: 2, p: 2, background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', color: '#fff', borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontStyle: 'italic' }}>
              "{todayQuote}"
            </Typography>
          </Paper>
        </Grid>
        {/* Column 2 */}
        <Grid gridColumn="span 1">
          {/* Quick Links */}
          <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
            <Button variant="contained" color="secondary" onClick={() => navigate('/insights')}>Insights</Button>
            <Button variant="contained" color="primary" onClick={() => navigate('/feed')}>Social Feed</Button>
          </Box>
          {/* Summary Card */}
          <Box display="flex" flexDirection="column" alignItems="center" width="100%" mb={2}>
            <Paper elevation={4} sx={{ p: 3, mb: 2, width: '100%', background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', color: '#fff', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Habit Summary</Typography>
              <Box display="flex" justifyContent="space-between" mb={1}><Typography>Total Habits:</Typography><Typography>{habits.length}</Typography></Box>
              <Box display="flex" justifyContent="space-between" mb={1}><Typography>Completed Today:</Typography><Typography>{getTodayCompleted()}</Typography></Box>
              <Box display="flex" justifyContent="space-between" mb={1}><Typography>Completed This Week:</Typography><Typography>{getWeeklyCompleted()}</Typography></Box>
              <Box display="flex" justifyContent="space-between" mb={1}><Typography>Current Streak:</Typography><Typography>{currentStreak} days</Typography></Box>
              <Box display="flex" justifyContent="space-between" mb={1}><Typography>Best Streak:</Typography><Typography>{bestStreak} days</Typography></Box>
              <Box display="flex" justifyContent="space-between" mb={1}><Typography>Missed Days (this week):</Typography><Typography>{getMissedDays()}</Typography></Box>
              {getMostConsistentHabit() && (<Box display="flex" alignItems="center" mb={1}><Typography variant="body2" sx={{ fontWeight: 600, color: '#ffd200', mr: 1 }}>Most Consistent Habit:</Typography><Typography variant="body2">{getMostConsistentHabit()}</Typography></Box>)}
              <Box mt={2}><Typography align="center" variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}><BarChartIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Completions by Difficulty</Typography><ResponsiveContainer width="100%" height={80}><BarChart data={[{ name: 'Easy', value: completionsByDifficulty.Easy },{ name: 'Medium', value: completionsByDifficulty.Medium },{ name: 'Hard', value: completionsByDifficulty.Hard }]}><XAxis dataKey="name" /><YAxis hide /><Tooltip /><Bar dataKey="value" fill="#43cea2" /></BarChart></ResponsiveContainer></Box>
              <Box mt={2}><ResponsiveContainer width="100%" height={60}><BarChart data={weeklyProgressData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="day" /><YAxis hide domain={[0, habits.length || 1]} /><Tooltip /><Bar dataKey="Completed" fill="#ffd200" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Box>
              <Box mt={2}><Typography align="center" variant="subtitle1" sx={{ fontWeight: 600 }}>{motivation}</Typography></Box>
              <Box mt={2}><Button variant="outlined" sx={{ mr: 1, color: '#fff', borderColor: '#fff' }} onClick={exportToCSV}>Export to CSV</Button><Button variant="outlined" sx={{ color: freezeUsed ? '#888' : '#ffd200', borderColor: freezeUsed ? '#888' : '#ffd200' }} onClick={handleFreezeStreak} disabled={freezeUsed}>Streak Freeze</Button></Box>
              <Box mt={2}><Typography align="center" variant="subtitle2" sx={{ fontWeight: 600 }}>{getPersonalizedQuote()}</Typography></Box>
              <Box mb={2}>
                <Typography variant="subtitle1" align="center" sx={{ color: '#ffd200', fontWeight: 700, mb: 1 }}>Achievements</Typography>
                <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2}>
                  {BADGES.map(badge => (
                    <Tooltip key={badge.key} title={badge.desc} arrow>
                      <Box display="flex" flexDirection="column" alignItems="center" sx={{ opacity: badges.includes(badge.key) ? 1 : 0.3 }}>
                        {badge.icon}
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{badge.name}</Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Box>
          {/* Calendar View */}
          <Paper elevation={2} sx={{ p: 2, mb: 2, width: '100%', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Habit Completion Calendar</Typography>
            <DateCalendar value={calendarDate} onChange={setCalendarDate} sx={{ background: '#fff', borderRadius: 2, color: '#222', mb: 1 }} />
            <Typography variant="body2">Completed Habits on {calendarDate.format('YYYY-MM-DD')}:<br />{completedOnDate(calendarDate).length > 0 ? completedOnDate(calendarDate).join(', ') : 'None'}</Typography>
          </Paper>
        </Grid>
      </Grid>
      {/* Snackbar/Notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} message={snackbarMsg} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      {/* Logout Dialog */}
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}><DialogTitle>Are you sure you want to logout?</DialogTitle><DialogActions><Button onClick={confirmLogout} color="primary">Yes</Button><Button onClick={() => setLogoutDialogOpen(false)} color="secondary">No</Button></DialogActions></Dialog>
    </Box>
  );
};

export default Dashboard; 