import exp from 'express';
import {config} from 'dotenv';
import {connect} from 'mongoose';
import cookieParser from 'cookie-parser';

config();

//create a express app
const app = exp();

app.use(cookieParser());
//body parser

app.use(exp.json());


//connect to database and server

const connectDB = async() =>{
    try {
        await connect(process.env.DB_URL);
        console.log('connected to database');

        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`server is running on port ${port}`);
        });
    }
    catch (error) {
        console.log(error);
    }
}

    connectDB();


    //error handling middleware
    app.use((err, req, res, next) => {
        console.log("error is ",err);
        res.status(500).json({message: "something went wrong"});

        //mongoose validation error handling
        if (err == "ValidationError") {
            res.status(400).json({message: err.message});
        }
        //mongo db duplicate key error handling
        const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  // Catch-all for unhandled server errors
  res.status(500).json({ message: "error occurred", error: "Server side error" });
});


