const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// MIDDLEWARES
app.use(morgan('dev'));

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// ROUTE HANDLERS
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours: tours },
  });
};

const getTour = (req, res) => {
  const id = req.params.id * 1; // * 1 to convert to a number OR +req.params.id;
  const tour = tours.find((el) => el.id === id);

  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'invalid ID' });
  }

  res.status(200).json({
    status: 'success',
    data: { tour: tour },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({ status: 'success', data: { tour: newTour } });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'invalid ID' });
  }

  res.status(200).json({
    status: 'success',
    data: { tour: '<Updated tour here>' },
    // skeleton example of patch without the javascript logic for data,
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'invalid ID' });
  }

  res.status(204).json({
    status: 'success',
    data: null,
    // skeleton example of delete without the javascript logic for data,
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({ status: 'err', message: 'route not yet defined' });
};

const createUser = (req, res) => {
  res.status(500).json({ status: 'err', message: 'route not yet defined' });
};

const getUser = (req, res) => {
  res.status(500).json({ status: 'err', message: 'route not yet defined' });
};

const updateUser = (req, res) => {
  res.status(500).json({ status: 'err', message: 'route not yet defined' });
};

const deleteUser = (req, res) => {
  res.status(500).json({ status: 'err', message: 'route not yet defined' });
};

//ROUTES

const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// START SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
