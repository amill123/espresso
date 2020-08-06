const express = require('express');
const menuitemRouter = express.Router({mergeParams: true});

console.log('menuItem');
const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');


menuitemRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM MenuItem WHERE menu_id = $menuId", {$menuId: req.params.menuId}, (err, item) => {
        if(err){
            next(err);
        } else {
            res.status(200).json({menuItems: item});
        }
    });
});

menuitemRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;

    if(!name || !inventory || !price){
        res.sendStatus(400);
    } else {
        db.run("INSERT INTO MenuItem(name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)", {$name: name, $description: description, $inventory: inventory, $price: price, $menuId: req.params.menuId}, function(err) {
            if(err){
                next(err);
            } else {
                db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, item) => {
                    res.status(201).json({menuItem: item});
                })
            }
        })
    }
});

menuitemRouter.param('menuItemId', (req, res, next, menuItemId) => {

    db.get("SELECT * FROM MenuItem WHERE id = $id", {$id: menuItemId}, (err, item) => {
        if(err){
            next(err);
        } else if(item) {
            req.item = item;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

menuitemRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;

    if(!name || !inventory || !price){
        res.sendStatus(400);
    } else{
        db.run("UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE id = $id", {$name: name, $description: description, $inventory: inventory, $price: price, $id: req.item.id}, function(err) {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM MenuItem WHERE id = $id`, {$id: req.item.id}, (err, item) => {
                    res.status(200).json({menuItem: item});
                })
            }
        })
    }
});

menuitemRouter.delete('/:menuItemId', (req, res, next) => {
    db.run("DELETE FROM MenuItem WHERE id = $id", {$id: req.item.id}, (err) => {
        if(err){
            next(err);
        } else {
            res.sendStatus(204);
        }
    })
})


module.exports = menuitemRouter;