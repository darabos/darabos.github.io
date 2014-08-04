var express = require('express');
app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.get('/belepes/:felhasznalo', function(req, res) {
  res.cookie('felhasznalo', req.params.felhasznalo);
  res.redirect('/valami');
});
app.get('/valami', function(req, res) {
  res.send('felhasználó: ' + req.cookies.felhasznalo);
});
app.listen(8001);
