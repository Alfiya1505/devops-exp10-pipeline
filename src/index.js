require('dotenv').config();
const createApp = require('./app');

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
});
