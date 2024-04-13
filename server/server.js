// server.js
const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.get('/next-halving', async (req, res) => {
	try {
		const response = await axios.get('https://api.coingecko.com/api/v3/events');
		const halvingEvents = response.data.filter(event => event.type === 'block_halving');
		const nextHalvingDate = new Date(halvingEvents[0].date).toISOString();
		res.json({ nextHalvingDate });
	} catch (error) {
		console.error('Error fetching next halving date:', error.message);
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
