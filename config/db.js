import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connect = async () => {
  mongoose.connect(
    "mongodb+srv://admin:1990xe98@cluster0.b86j3.mongodb.net/hospital?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
};

let con = mongoose.connection;

con.once('open', () => {
  console.log('Connected to MongoDB');
});

con.on('error', (err) => {
  console.log(err);
});


export default connect;
