const express = require('express');
const router = express.Router();

// Sales route stub - to be populated by Member 2
router.get('/', (req, res) => {
  res.json({ success: true, data: [], message: 'Sales endpoint ready' });
});

module.exports = router;
