const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => console.log('DB connection success'))
  .catch((err) => console.log('DB connection error: ', err));

// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// import data into DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data loaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// delete all data from db
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data deleted!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
