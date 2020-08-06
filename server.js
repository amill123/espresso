const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');

const PORT = process.env.PORT || 4000;
const apiRouter = require('./api/api.js');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());

app.use('/api', apiRouter);



//Errorhandler should remain close to the bottom so that everything above is passed through the error handler
app.use(errorhandler());

app.listen(PORT, () => {
    console.log(`Server located at ${PORT}`);
});
module.exports = app;