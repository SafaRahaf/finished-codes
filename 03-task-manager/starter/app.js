const express = require('express');
const app = express();
const tasks = require('./routes/tasks');
const connectdb = require('./db/connect');
require('dotenv').config();
const notFound = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.static('./public'));
app.use(express.json());

app.use('/api/v1/tasks', tasks);
app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectdb(process.env.MONGO_URI);
    app.listen(port, console.log(`Server running on port:${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
