const express = require('express');
const db = require('./config/db');
const cors = require('cors');
const path = require('path');
const endpoints = require('./routes/index')

const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use("/static_data", express.static(path.join(__dirname, "static_data")));

// root endpoints
app.use('/', endpoints);

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});