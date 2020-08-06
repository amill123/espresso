const express = require('express');
const apiRouter = express.Router();


const employeeRouter = require('./employee.js');
apiRouter.use('/employees', employeeRouter);

const menuRouter = require('./menu.js');
apiRouter.use('/menus', menuRouter);


module.exports = apiRouter;