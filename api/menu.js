const express = require('express');

const menuRouter = express.Router();


const sqlite = require('sqlite3');
console.log('menu');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database/sqlite');


menuRouter.get('/', (req, res, next) => {

    db.all('SELECT * FROM Menu',(err, menus) => {
        if(err) {
            next(err);
        } else{
            res.status(200).json({menus: menus});
        }
    });

});

menuRouter.post('/', (req, res, next) => {
    const menuName = req.body.menu.title;
    if(!menuName) {
        return res.sendStatus(400);
    }
    db.run('INSERT INTO Menu(title) VALUES ($title)', {$title:menuName}, function(error){
        if(error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Menu WHERE id= ${this.lastID}`, (err,row) => {
                res.status(201).json({menu: row});
            })
        }
    })
});

menuRouter.param('menuId', (req, res, next, menuId) => {
    db.get("SELECT * FROM Menu WHERE id = $id", {$id: menuId}, (err, menuId) => {
        if(err) {
            next(err);
        } else {
            if(menuId){
                req.menu = menuId;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    })
})

const menuitemRouter = require('./menuitem.js');
menuRouter.use('/:menuId/menu-items', menuitemRouter);

menuRouter.get('/:menuId', (req, res, next) => {
 res.status(200).json({menu: req.menu})
});

menuRouter.put('/:menuId', (req, res, next) => {
    if(!req.body.menu.title){
        res.sendStatus(400);
    } else {
        db.run("UPDATE Menu SET title = $name WHERE id = $id", {$name:  req.body.menu.title, $id: req.menu.id}, (err) => {
            if(err){
                next(err);
            } else {
                db.get("SELECT * FROM Menu WHERE id = $id", {$id: req.menu.id}, (err, row) => {
                        res.status(200).json({menu: row});
                })
            }
        })
    }
})


menuRouter.delete('/:menuId', (req, res, next) => {
    let items = 0;
    db.all('SELECT * FROM MenuItem WHERE menu_id = $menuId', {$menuId: req.menu.id}, (err, item) => {
        if(err) {
            next(err);
        } else if(item.length>0) {
            items= items+1;
            res.sendStatus(400);
        } else {
            db.run("DELETE FROM Menu WHERE id = $id", {$id: req.menu.id}, (err) => {
                if(err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            })
        }
    });
})

module.exports = menuRouter;