var express = require('express');
var router = express.Router();
var pg = require('pg');
var constring = process.env.DATABASE_URL
var client = new pg.Client(constring);
client.connect(function (err) {
    if (err) {
        return console.error("couldn't connect to postgres", err);
    }
})



/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {title: 'Express'});
});

router.get('/helloworld', function (req, res) {
    res.render('helloworld', {title: 'Hello, World!'})
});

router.get('/todo', function (req, res) {
    res.render('todo')
})

// to Get Tasks
router.get('/todo/tasks', function(req, res){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    var query = client.query("select * from todo");
    query.on("row", function(row, result) {
        result.addRow(row);
    });
    query.on("error", function(){
        console.log("error");
    })
    query.on("end", function(result){
        res.send(JSON.stringify(result.rows, null, " ") );
        res.end();
    })

})
// to create task
router.post('/todo/create', function (req, res) {
    var OK = {status: 'OK'};
    var NOK = {status: 'NOK'};
    var data = req.body;
    console.log(JSON.stringify(data));
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    console.log(data);
    var query = client.query("insert into todo(task,done,enddatetime, createdatetime) " +
    "values($1,$2,$3,$4) returning id",[data.task,data.done, data.enddatetime, data.createdatetime]);
    query.on("row", function(row,result){
        OK.id = row.id
        console.log(row.id);
    })
    query.on('end', function(row){
        console.log("end of query");
        res.send(JSON.stringify(OK));
        res.end();
    })
    query.on('error', function(error) {
        console.error('error running query', error);
        res.send(JSON.stringify(NOK));
        res.end();
    })

})
// to update status
router.put('/todo/task/update', function(req, res) {
    var OK = {status: 'OK'};
    var NOK = {status: 'NOK'};
    var data = req.body;
    console.log(data);
    var query = client.query("update todo set done= not done  , finisheddatetime = $2 where id=$1",[data.id, data.finisheddatetime]);
    query.on('end', function() {
        console.log('end of query');
        res.send(JSON.stringify(OK));
        res.end();
    });
    query.on('error', function(error){
        console.error('error running query', error);
        res.send(JSON.stringify(NOK));
        res.end();
    })

})


module.exports = router;
