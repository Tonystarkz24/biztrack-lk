const express = require('express');
const router = express.Router();

// Expenses route stub - to be populated by Member 3
router.get('/', (req, res) => {
  res.json({ success: true, data: [], message: 'Expenses endpoint ready' });
});

module.exports = router;
