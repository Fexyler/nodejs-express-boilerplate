const mongoose = require('mongoose');

const options = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(process.env.MONGO_URI, options).then(() => {
  console.log(`MongoDB ready to use`);
});

mongoose.connection.on('connected', () => {
  console.log('Connected to the MongoDB...');
});

mongoose.connection.on('error', (err) => {
  console.log(`MongoDB connection error : ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Connection between Express and MongoDB is dead now.');
});
