var express = require('express');
var app = express();
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

app.get('/mentes', function(req, res) {
  console.log(req.params);
});

app.use(express.static(__dirname + '/public'));
app.listen(8000);
