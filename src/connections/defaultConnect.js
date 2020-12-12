import mongoose from 'mongoose';
import createError from 'http-errors';

const connString = process.env.MONGO_DB_URL || 'mongodb://127.0.0.1:27017/emaginer-api';
    try {
        await mongoose.connect(connString, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
    }catch (e) {
        // @todo log the error
        // expose - can be used to signal if message should be sent to the client, defaulting to false when status >= 500
        throw createError(`Error in connecting to database ${e}`,{expose: false});
    }
    const connection = mongoose.connection;
    connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

