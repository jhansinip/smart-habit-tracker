import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Box, Paper, Typography, Button } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const SharedHabit = () => {
  const { habitId } = useParams();
  const [habit, setHabit] = useState(null);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHabit = async () => {
      const docRef = doc(db, 'habits', habitId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setHabit(docSnap.data());
        setLikes(docSnap.data().likes || 0);
      }
      setLoading(false);
    };
    fetchHabit();
  }, [habitId]);

  const handleCheer = async () => {
    const docRef = doc(db, 'habits', habitId);
    await updateDoc(docRef, { likes: (likes || 0) + 1 });
    setLikes(likes + 1);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!habit) return <Typography>Habit not found.</Typography>;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper elevation={4} sx={{ p: 4, minWidth: 320, textAlign: 'center', background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', color: '#fff', borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>{habit.name}</Typography>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Category: {habit.category}</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>Streak: {habit.streak || 0} days</Typography>
        <Button variant="contained" color="secondary" startIcon={<EmojiEventsIcon />} onClick={handleCheer} sx={{ mb: 2 }}>
          Cheer ({likes})
        </Button>
        <Typography variant="body2">Share this link to get more cheers!</Typography>
      </Paper>
    </Box>
  );
};

export default SharedHabit; 