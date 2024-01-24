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

const uploader = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      cb(null, `${Date.now()}.${ext}`);
    },
  }),
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/upload', uploader.single('file'), (req, res) => {
  console.log(req.file);
  console.log(req.body);
  res.send('File uploaded');
});

app.listen(5010, () => {
  console.log('Server running on port 5010');
});
