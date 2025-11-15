const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('🎉 Server is working!');
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server listening on port ${PORT}`);
});
