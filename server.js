const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const pool = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.send("✅ Rotai Dairy Backend is running and connected to the database!");
});

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// --- Milk Production Endpoints ---

// Get all milk records
app.get('/api/milk', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM milk_production ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching milk:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a milk record
app.post('/api/milk', async (req, res) => {
  const { cow_name, date, milk_kg } = req.body;
  if (!cow_name || !date || milk_kg == null) {
    return res.status(400).json({ error: 'cow_name, date, and milk_kg are required' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO milk_production (cow_name, date, milk_kg) VALUES ($1, $2, $3) RETURNING *',
      [cow_name, date, milk_kg]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error adding milk record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// --- Milk Sales Endpoints ---

// Get all milk sales
app.get('/api/sales', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM milk_sales ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching sales:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a milk sale
app.post('/api/sales', async (req, res) => {
  const { date, quantity_kg, price_per_kg, buyer } = req.body;
  if (!date || !quantity_kg || !price_per_kg) {
    return res.status(400).json({ error: 'date, quantity_kg, and price_per_kg are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO milk_sales (date, quantity_kg, price_per_kg, buyer)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [date, quantity_kg, price_per_kg, buyer || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error adding sale:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// --- Expenses Endpoints ---

// Get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add an expense
app.post('/api/expenses', async (req, res) => {
  const { date, category, description, amount } = req.body;
  if (!date || !category || !amount) {
    return res.status(400).json({ error: 'date, category, and amount are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO expenses (date, category, description, amount)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [date, category, description || null, amount]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error adding expense:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

