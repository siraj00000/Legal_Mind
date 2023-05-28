const express = require("express");
// const multer = require('multer')
// const fs = require('fs')  
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Configuration, OpenAIApi } = require("openai");
const app = express();
const db = require("./config/db");

require("dotenv").config();
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your front-end URL
    methods: "GET,POST,PUT,DELETE,OPTIONS", credentials: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/../client/public"));
app.use(cookieParser());

const PORT = process.env.PORT || 3000;
app.use("/user", require("./routes/users"));
app.use("/doc", require("./routes/document"));

// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//     cb(null, 'public')
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' +file.originalname )
//   }
// })
// var upload = multer({ storage: storage }).single('file')

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
let GPT35Turbo = async (message) => {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: message,
    });
    return response.data.choices[0].message.content;
};


//! GPT-3.5 Turbo AP
app.post("/api/v1/improve", (req, res) => {
  const { text, lang } = req.body;
  const GPT35TurboMessage = [{
    role: "system",  
    content: `You are a helpful assistant designed to explain complex documents to users. They will provide you with long passage of text, 
       and you will have to simplify them and explain to them in an easy to understand language with analogies and examples (if needed).\n Explain this document in ${lang} language, easily: \n ${text}`,
}];
    GPT35Turbo(GPT35TurboMessage).then((response) => {
        console.log(response);
        return res.send("IMPROVED TEXT");
      }).catch((err) => {
        console.log(err);
        return res.send("ERROR");
      });
  });

  

//! Upload api, takes file from frontend 
app.post('/upload', function(req, res) {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    // Read the contents of the file
    const filePath = req.file.path;
    fs.readFile(filePath, function(err, data) {
      if (err) {
        return res.status(500).json(err);
      }
      const fileData = data.toString();

      return res.status(200).json(fifleData);
    });
  });
});


app.listen(PORT, function () {
    console.log(`Server Runs Perfectly at http://localhost:${PORT}`);
});
