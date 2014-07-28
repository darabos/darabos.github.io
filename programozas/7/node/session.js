var express = require('express');
app = express();
var session = require('cookie-session');
app.use(session({ secret: 'titok' }));
app.get('/belepes/:felhasznalo', function(req, res) {
  req.session.felhasznalo = req.params.felhasznalo;
  res.redirect('/valami');
});
app.get('/valami', function(req, res) {
  res.send('felhasználó: ' + req.session.felhasznalo);
});
app.listen(8001);
