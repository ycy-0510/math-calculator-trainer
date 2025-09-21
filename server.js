
const express = require('express');
const path = require('path');

const app = express();
const port = 80;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
