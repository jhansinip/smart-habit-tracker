import React, { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';

const COLORS = ['#43cea2', '#667eea', '#ffd200', '#f7971e', '#888', '#e53935', '#ffb300'];

const Insights = () => {
  const user = auth.currentUser;
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchHabits = async () => {
      const q = query(collection(db, 'habits'), where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const arr = [];
      querySnapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      setHabits(arr);
      setLoading(false);
    };
    fetchHabits();
  }, [user]);

  // 1. Heatmap calendar data (YYYY-MM-DD => count)
  const heatmap = {};
  habits.forEach(h => {
    (h.completedDates || []).forEach(date => {
      heatmap[date] = (heatmap[date] || 0) + 1;
    });
  });
  const last90 = Array.from({ length: 90 }).map((_, i) => {
    const d = dayjs().subtract(89 - i, 'day').format('YYYY-MM-DD');
    return { date: d, count: heatmap[d] || 0 };
  });

  // 2. Pie chart of habits by category
  const catCounts = {};
  habits.forEach(h => {
    catCounts[h.category || 'Other'] = (catCounts[h.category || 'Other'] || 0) + 1;
  });
  const pieData = Object.entries(catCounts).map(([name, value]) => ({ name, value }));

  // 3. Best time of day (placeholder, as time is not tracked)
  const bestTime = '8:00 AM';

  // 4. Week-over-week comparison
  const getWeek = (offset = 0) => {
    const week = Array.from({ length: 7 }).map((_, i) => dayjs().subtract(i + offset * 7, 'day').format('YYYY-MM-DD'));
    return week.reverse();
  };
  const thisWeek = getWeek(0);
  const lastWeek = getWeek(1);
  const weekData = [
    { name: 'This Week', value: habits.reduce((sum, h) => sum + (h.completedDates ? h.completedDates.filter(d => thisWeek.includes(d)).length : 0), 0) },
    { name: 'Last Week', value: habits.reduce((sum, h) => sum + (h.completedDates ? h.completedDates.filter(d => lastWeek.includes(d)).length : 0), 0) }
  ];

  return (
    <Box minHeight="100vh" p={3} sx={{ background: 'linear-gradient(120deg, #43cea2 0%, #667eea 100%)' }}>
      <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#fff', mb: 4 }}>Insights & Analytics</Typography>
      {loading ? <Typography align="center">Loading...</Typography> : (
        <Grid container columns={2} columnSpacing={4} justifyContent="center">
          {/* Heatmap Calendar */}
          <Grid gridColumn="span 1">
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Completion Heatmap (Last 90 Days)</Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {last90.map((d, i) => (
                  <Box key={d.date} width={16} height={16} borderRadius={1} bgcolor={d.count === 0 ? '#eee' : d.count === 1 ? '#b2f7ef' : d.count === 2 ? '#43cea2' : '#185a9d'} title={`${d.date}: ${d.count}`} />
                ))}
              </Box>
            </Paper>
          </Grid>
          {/* Pie Chart by Category */}
          <Grid gridColumn="span 1">
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Habits by Category</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          {/* Best Time of Day (placeholder) */}
          <Grid gridColumn="span 1">
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Best Time of Day</Typography>
              <Typography variant="h4" align="center" sx={{ color: '#43cea2', fontWeight: 700 }}>{bestTime}</Typography>
              <Typography align="center" sx={{ color: '#888' }}>(Feature coming soon: track completion times!)</Typography>
            </Paper>
          </Grid>
          {/* Week-over-Week Comparison */}
          <Grid gridColumn="span 1">
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Week-over-Week Comparison</Typography>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#667eea" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Insights; 