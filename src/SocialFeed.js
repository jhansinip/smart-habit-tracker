import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Box, Paper, Typography, Button, Avatar, Grid } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const SocialFeed = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHabits = async () => {
      const q = query(collection(db, 'habits'));
      const querySnapshot = await getDocs(q);
      const feed = [];
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if ((data.likes || 0) > 0) {
          feed.push({ id: docSnap.id, ...data });
        }
      });
      feed.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      setHabits(feed);
      setLoading(false);
    };
    fetchHabits();
  }, []);

  const handleCheer = async (habitId, currentLikes) => {
    const docRef = doc(db, 'habits', habitId);
    await updateDoc(docRef, { likes: (currentLikes || 0) + 1 });
    setHabits(habits => habits.map(h => h.id === habitId ? { ...h, likes: (h.likes || 0) + 1 } : h));
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (habits.length === 0) return <Typography>No shared habits yet. Be the first to share!</Typography>;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5" p={2}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#764ba2' }}>Social Feed</Typography>
      <Grid container spacing={3} justifyContent="center">
        {habits.map(habit => (
          <Grid item key={habit.id} xs={12} sm={6} md={4}>
            <Paper elevation={4} sx={{ p: 3, minWidth: 260, textAlign: 'center', background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', color: '#fff', borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: habit.color || '#667eea', mx: 'auto', mb: 1 }}>{habit.name[0]}</Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{habit.name}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Category: {habit.category}</Typography>
              <Button variant="contained" color="secondary" startIcon={<EmojiEventsIcon />} onClick={() => handleCheer(habit.id, habit.likes)} sx={{ mb: 1 }}>
                Cheer ({habit.likes || 0})
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SocialFeed; 