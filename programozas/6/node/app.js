var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

var babak = {
  felix: {
    azonosito: 'felix',
    neve: 'Félix',
    meresek: [
      { datum: '2014-05-04', suly: 3400 },
      { datum: '2014-05-05', suly: 3300 },
      { datum: '2014-05-06', suly: 3200 },
    ],
  },
};

app.get('/baba/:azonosito', function(req, res) {
  var baba = babak[req.params.azonosito];
  res.render('baba.hjs', baba);
});

app.post('/mentes', function(req, res) {
  var uj = req.body;
  babak[uj.azonosito].meresek.unshift({ datum: uj.datum, suly: uj.suly });
});

app.use(express.static(__dirname + '/public'));
app.listen(process.env.PORT || 8000);
