const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const healthRoutes = require('./routes/healthRoutes');
const productRoutes = require('./routes/productRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api/products', productRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
