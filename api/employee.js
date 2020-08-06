const express = require('express');
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');
console.log('employee');
const db =  new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.get('/', (req, res, next) => {

    db.all("SELECT * FROM Employee WHERE is_current_employee = 1", (err, employee) => {
        if(err){
            next(err);
        } else {
            res.status(200).json({employees: employee});
        }
    });
    
});

employeeRouter.post('/', (req, res, next) => {

    if(!req.body.employee.name || !req.body.employee.position || !req.body.employee.wage){
        res.sendStatus(400);
    } else {
        db.run("INSERT INTO Employee(name, position, wage, is_current_employee) VALUES ($name, $position, $wage, 1)", {$name: req.body.employee.name, $position: req.body.employee.position, $wage: req.body.employee.wage}, function(err) {
            if(err){
                next(err);
            } else {
                db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, employee) => {
                    res.status(201).json({employee: employee});
                })
            }
        });
    }
});

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get("SELECT * FROM Employee WHERE id = $id", {$id: employeeId}, (err, employee) => {
        if(err){
            next(err);
        } else if(employee){
            req.employee = employee;
            next();
        } else {
            res.sendStatus(404);
        }
    })
});

const timesheetRouter = require('./timesheet.js');
employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
});

employeeRouter.put('/:employeeId', (req,res, next) => {
    if(!req.body.employee.name || !req.body.employee.wage || !req.body.employee.position){
        res.sendStatus(400);
    } else {
        db.run("UPDATE Employee SET name = $name, wage = $wage, position = $position WHERE id = $id", {$name: req.body.employee.name, $wage: req.body.employee.wage, $position: req.body.employee.position, $id: req.params.employeeId}, function(err) {
            if(err){
                next(err);
            } else {
                db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,(err,employee)=>{
                    res.status(200).json({employee: employee});
                })
            }
        })
    }
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
    db.run("UPDATE Employee Set is_current_employee = 0 WHERE id = $id", {$id: req.employee.id}, function(err, employee) {
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) => {
                res.status(200).json({employee: employee});
            })

        }
    })
})


module.exports = employeeRouter;