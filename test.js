const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://YOUR_NEW_USERNAME:YOUR_NEW_PASSWORD@cluster0.mclyp3i.mongodb.net/zikhali-rev?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected!");
    process.exit();
  })
  .catch((err) => {
    console.log(err);
  });

