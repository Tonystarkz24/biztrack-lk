const express = require('express');
const router = express.Router();

const healthResponse = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend server is running'
  });
};

router.get('/', healthResponse);

module.exports = router;
