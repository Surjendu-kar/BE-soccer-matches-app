const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Football-data.org API configuration
const FOOTBALL_API_BASE_URL = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_API_KEY;

// API headers
const apiHeaders = {
  'X-Auth-Token': API_KEY,
  'Content-Type': 'application/json'
};

// Route to get upcoming matches
app.get('/api/matches', async (req, res) => {
  try {
    // Get today's and upcoming matches
    const response = await axios.get(`${FOOTBALL_API_BASE_URL}/matches`, {
      headers: apiHeaders,
      params: {
        status: 'SCHEDULED', // Only upcoming matches
        dateFrom: new Date().toISOString().split('T')[0], // From today
        dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Next 7 days
      }
    });

    // Transform the data to include only what we need
    const matches = response.data.matches.map(match => ({
      id: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      competition: match.competition.name,
      date: match.utcDate,
      status: match.status,
      matchday: match.matchday || null
    }));

    res.json({
      success: true,
      count: matches.length,
      matches: matches
    });

  } catch (error) {
    console.error('Error fetching matches:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matches',
      message: error.response?.data?.message || error.message
    });
  }
});

// Route to get available competitions
app.get('/api/competitions', async (req, res) => {
  try {
    const response = await axios.get(`${FOOTBALL_API_BASE_URL}/competitions`, {
      headers: apiHeaders
    });

    const competitions = response.data.competitions.map(comp => ({
      id: comp.id,
      name: comp.name,
      code: comp.code,
      area: comp.area.name,
      plan: comp.plan
    }));

    res.json({
      success: true,
      competitions: competitions
    });

  } catch (error) {
    console.error('Error fetching competitions:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch competitions',
      message: error.response?.data?.message || error.message
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Soccer Matches API is running!',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api/matches`);
});