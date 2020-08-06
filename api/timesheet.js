const express = require('express');

//Need to merge Params to use parent router parameters
const timesheetRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
console.log('timesheet');
const db =  new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`, (err, timesheets) => {
        if(err){
            next(err);
        } else {
            res.status(200).json({timesheets: timesheets});
        }
    });

});

timesheetRouter.post('/', (req, res, next) => {
    const rate = req.body.timesheet.rate;
    const hours = req.body.timesheet.hours;
    const date = req.body.timesheet.date;

    if(!rate || !hours || !date){
        res.sendStatus(400);
    } else {
        db.run(`INSERT INTO Timesheet(rate, hours, date, employee_id) VALUES ($rate, $hours, $date, ${req.params.employeeId})`, {$rate: rate, $hours: hours, $date: date}, function(err) {
            if(err){
                next(err);
            } else {
                db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, timesheet) => {
                    res.status(201).json({timesheet: timesheet});
                })
            }
        })
    }
});

timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {


    db.get("SELECT * FROM Timesheet WHERE id = $id", {$id: timesheetId}, (err, timesheet) => {
        if(err){
            next(err);
        } else if(timesheet){
            req.timesheet = timesheet;
            next();
        } else {
            res.sendStatus(404);
        }
    })
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const date = req.body.timesheet.date;
    const rate = req.body.timesheet.rate;
    if(!hours || !date || !rate){
        res.sendStatus(400);
    } else {
        db.run(`UPDATE Timesheet SET hours = $hours, date = $date, rate = $rate WHERE id = $id`, {$hours: hours, $date: date, $rate: rate, $id:req.timesheet.id}, (err) => {
            if(err){
                next(err);
            } else {
                db.get(`SELECT * FROM Timesheet WHERE id = ${req.timesheet.id}`, (err, timesheet) => {
                    res.status(200).json({timesheet: timesheet});
                });
            }
        });
    }
});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
    db.run('DELETE FROM Timesheet WHERE id = $id', {$id: req.timesheet.id}, (err) => {
        if(err){
            next();
        } else {
            res.sendStatus(204);
        }
    })
})




module.exports = timesheetRouter;