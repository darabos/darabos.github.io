var express = require('express')
var app = express();
app.get('/', function(req, res) {
    res.send('<h1>hello</h1>');
})
var count = 0;
app.get('/baba', function(req, res) {
    res.render('baba.hjs', {hello: count});
    count += 1;
})
app.use(express.static(__dirname + '/public'));
app.listen(8000)
