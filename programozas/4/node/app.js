var express = require('express')
var app = express();
app.get('/', function(req, res) {
    res.send('<h1>hello</h1>');
})
app.get('/baba/:neve', function(req, res) {
    res.render('baba.hjs', {neve: req.params.neve});
})
app.use(express.static(__dirname + '/public'));
app.listen(8000)
