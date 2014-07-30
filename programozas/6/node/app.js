var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

function query(q, ps, cb) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      return console.error('db kliens:', err);
    }
    client.query(q, ps, function(err, res) {
      done();
      if (err) {
        return console.error(q, 'nem sikerult:', err);
      } else if (cb) {
        cb(res);
      }
    });
  });
}

app.get('/baba/:azonosito', function(req, res) {
  query(
    'SELECT datum, suly FROM adatok WHERE azonosito = $1 ORDER BY datum DESC',
    [req.params.azonosito],
    function(meresek) {
      res.render(
        'baba.hjs',
        { azonosito: req.params.azonosito, neve: req.params.azonosito, meresek: meresek }
      );
    }
  );
});

app.post('/mentes', function(req, res) {
  var uj = req.body;
  query('INSERT INTO adatok VALUES ($1, $2, $3)', [uj.azonosito, uj.datum, uj.suly]);
});

app.use(express.static(__dirname + '/public'));
app.listen(process.env.PORT || 8000);
