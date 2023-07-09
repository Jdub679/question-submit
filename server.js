const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const fs = require('fs')


const app = express()
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'));

const jsonFilePath = 'questions.json';


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the directory where uploaded files will be stored
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    // Use the original file name as the uploaded file name
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage, limits: {fileSize: 1024 * 1024 * 5 } });

// Check if the file exists
if (!fs.existsSync(jsonFilePath)) {
  // Create an empty JSON object
  const initialData = {};

  // Write the initial data to the file
  fs.writeFileSync(jsonFilePath, JSON.stringify(initialData), 'utf-8');
}

// Root route
app.get('/', (req, res) => {
  res.render('index', { authenticated })
});

let authenticated = false
app.post('/login', (req, res) => {
  const password = 'anki-generator';
  const { password: submittedPassword } = req.body;

  if (submittedPassword === password) {
    authenticated = true;
    res.redirect('/');
  } else {
    res.redirect('/');
  }
});

app.post('/submit', upload.single('imageFile'), (req, res) => {
  const { selectionType, question, answer, extra } = req.body;

  const imageFile = req.file;
  const imagePath = imageFile ? `uploads/${imageFile.filename}` : null;

  // Read the existing JSON data from the file
  let jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
  let data = JSON.parse(jsonData);
 
  if (!data[selectionType]) {
    data[selectionType] = [];
  }
 
  // Add the submitted form data to the corresponding selection type
  data[selectionType].push({
    question,
    answer,
    extra,
    image: imagePath
  });

  // Move the uploaded file to the 'uploads/' directory
  if (imageFile) {
    fs.renameSync(imageFile.path, imagePath);
  }
  
  // Write the updated data back to the JSON file
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf-8');

  res.redirect('/');
});

// Port to listen on
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



