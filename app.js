var 	express = require('express'), 
	app = express(), 
	engines = require('consolidate'),
	MongoClient = require('mongodb').MongoClient,
	assert = require('assert'),
	bodyParser = require('body-parser');

	app.engine('html', engines.nunjucks);
	app.set('view engine', 'html');
	app.set('views', __dirname + '/views');
	
	// parse application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded({ extended: false }));
	// parse application/json
	app.use(bodyParser.json());

	var mongoHost = "mongodb://m121:aggregations@cluster0-shard-00-00-jxeqq.mongodb.net:27017,cluster0-shard-00-01-jxeqq.mongodb.net:27017,cluster0-shard-00-02-jxeqq.mongodb.net:27017/aggregations?authMechanism=DEFAULT&authSource=admin";

	// Handle internal server errors
	function errorHandler(err, req, res, next) {
		console.error(err.message);
		console.error(err.stack);
		res.status(500);
		res.render('error', { error: err} );
	}
	
	app.use(errorHandler);

	
	MongoClient.connect(mongoHost, {  ssl: true, replSet: { 'rs_name': 'Cluster0-shard-0'} }, function(err, database) {
		
		assert.equal(null, err);
		db = database.db('aggregations');

		app.get('/favourites', function(req, res) {
			var collection = db.collection('movies');

                        collection.find({}).limit(5).toArray(function(err, records) {
                                res.render('favourites', { 'movies': records} );
                        });
		});
		app.post('/favourites', function(req, res, next) {
			var favourite = req.body.movie;
			if(typeof favourite === 'undefined') {
				next(Error('Please make selection'));
			} else {
				res.send("Your favourite movie is: " + favourite);
			}
		});

		app.get('/test', function(req, res) {
			res.send('Hello World');
		});
		app.get('/page1', function(req, res){
			res.render('hello', { 'name': 'Swapnil'});
		});
		app.get('/movies', function(req, res) {
			var collection = db.collection('movies');

			collection.find({}).limit(5).toArray(function(err, records) {
				res.render('movies', { 'movies': records} );
			});
		});
		app.get('/search/:collection_name', function(req, res) {
			var search_collection = req.params.collection_name;
			var find = req.query.filter || {};
			console.log('find', find);
			var collection = db.collection(search_collection);
			collection.find(find).limit(5).toArray(function(err, records) {
				console.log('roc', records);
			});
		});
	
		app.use(function(req, res){ res.send('Fuck Off'); });

		var server = app.listen(3000, function(){
			var port = server.address().port;
			console.log('Express listening %s', port);
		});

	});
