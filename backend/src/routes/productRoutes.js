const express = require('express');
const router = express.Router();

// Products route stub - to be populated by Member 1
router.get('/', (req, res) => {
  res.json({ success: true, data: [], message: 'Products endpoint ready' });
});

module.exports = router;
