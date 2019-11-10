const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favorites = require('../models/favorite');
var authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Favorites.find({})
    .populate('user')
    .populate('dish')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (!favorite){
            Favorites.create(req.body)
            .then((newFav) => {
                console.log('Favorite Created ', newFav);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(newFav);
            }, (err) => next(err))
            .catch((err) => next(err));
        } else {
            req.params.dishes.forEach((dish)=>{
                favorite.dishes.push(dish)
            })
            favorite.save()
            .then((newDish) => {
                console.log('New Dish in favorite Created ', newDish);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(newDish);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({user: req.user._id})
    .then((favorite) => {
        favorite.remove({})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
});


favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Favorites.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite){
            if (favorite.dishes.indexOf(req.params.dishId) == -1){
                req.params.dishes.forEach((dish)=>{
                    favorite.dishes.push(dish)
                })
                favorite.save()
                .then((newDish) => {
                    console.log('New Dish in favorite Created ', newDish);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(newDish);
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/dishId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite){
            if (favorite.dishes.indexOf(req.params.dishId) >=0){
                favorite.splice(favorite.dishes.indexOf(req.params.dishId))
                favorite.save()
                .then((newDish) => {
                    console.log('New Dish in favorite Created ', newDish);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(newDish);
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;