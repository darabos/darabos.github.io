var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
client = new pg.Client(process.env.DATABASE_URL);
client.connect();

app.get('/baba/:azonosito', function(req, res) {
  var query = client.query('SELECT datum, suly FROM adatok WHERE azonosito = $1 ORDER BY datum DESC', [req.params.azonosito]);
  var sorok = [];
  query.on('row', function(sor) {
    sorok.push(sor);
  });
  query.on('end', function() {
    res.render('baba.hjs', { azonosito: req.params.azonosito, neve: req.params.azonosito, meresek: sorok });
  });
  query.on('error', function(e) {
    console.log('hiba', e);
  });
});

app.post('/mentes', function(req, res) {
  var uj = req.body;
  var query = client.query('INSERT INTO adatok VALUES ($1, $2, $3)', [uj.azonosito, uj.datum, uj.suly]);
  query.on('error', function(e) {
    console.log('hiba', e);
  });
});

app.use(express.static(__dirname + '/public'));
app.listen(process.env.PORT || 8000);
