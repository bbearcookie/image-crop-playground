import express from 'express';
import multer from 'multer';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const whitelist = ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (origin && whitelist.indexOf(origin) !== -1) callback(null, true);
      else callback(null, false);
    },
  })
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/upload', multer().single('file'), (req, res) => {
  console.log(req.file);
  console.log(req.body);
  res.send('File uploaded');
});

app.listen(5010, () => {
  console.log('Server running on port 5010');
});
