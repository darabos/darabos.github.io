var express = require('express');
var session = require('cookie-session');
var pg = require('pg');
var bodyParser = require('body-parser');
var passport = require('passport')
var facebook = require('passport-facebook');
var app = express();
var titok = process.env.TITOK;
app.use(bodyParser.json());
app.use(session({ secret: titok }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new facebook.Strategy(
  {
    clientID: '312500572251092',
    clientSecret: titok,
    callbackURL: 'http://frozen-plains-6587.herokuapp.com/facebooktol',
  },
  function(accessToken, refreshToken, profile, done) {
    done(null, profile);
  }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
// Hamis autentikáció offline fejlesztéshez.
app.use(function(req, res, next) {
  req.isAuthenticated = function() { return true };
  req.user = { id: 'test' };
  next();
});

function adatbazis(q, ps, cb) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
      return console.error('db kliens:', err);
    }
    client.query(q, ps, function(err, res) {
      done();
      if (err) {
        return console.error(q, 'nem sikerult:', err);
      } else if (cb) {
        cb(res.rows);
      }
    });
  });
}

function belepve(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.session.redirect = req.path;
    passport.authenticate('facebook')(req, res, next);
  }
}

function babak(szulo, utana) {
  adatbazis(
    'SELECT azonosito, nev FROM babak WHERE szulo = $1 ORDER BY nev',
    [szulo],
    utana
  );
}

function baba(azonosito, utana) {
  adatbazis(
    'SELECT nev, szulo FROM babak WHERE azonosito = $1',
    [azonosito],
    function(babak) {
      adatbazis(
        'SELECT datum, suly FROM adatok WHERE azonosito = $1 ORDER BY datum',
        [azonosito],
        function(adatok) {
          utana(babak[0], adatok);
        }
      );
    }
  );
}

function render(res, t, params) {
  var ps = { partials: { content: t } };
  for (var p in params) {
    ps[p] = params[p];
  }
  res.render('layout.hjs', ps);
}

app.get('/', function(req, res) {
  if (req.isAuthenticated()) {
    babak(req.user.id, function(babak) {
      render(res, 'babak.hjs', { title: 'Babaverseny', szulo: req.user.displayName, babak: babak });
    });
  } else {
    render(res, 'bemutatkozo.hjs', { title: 'Babaverseny' });
  }
});

app.get('/belepes', belepve, function(req, res) {
  res.redirect('/');
});

app.get('/kilepes', function(req, res) {
  req.session = null;
  res.redirect('/');
});

app.get('/facebooktol', passport.authenticate('facebook'), function(req, res) {
  res.redirect(req.session.redirect || '/');
});

app.get('/baba/:azonosito', belepve, function(req, res) {
  baba(req.params.azonosito, function(baba, meresek) {
    if (baba.szulo !== req.user.id) {
      res.redirect('/');
    } else {
      render(res, 'baba.hjs', {
        title: baba.nev + ' a Babaversenyen',
        szulo: req.user.displayName,
        azonosito: req.params.azonosito,
        neve: baba.nev,
        meresek: meresek
      });
    }
  });
});

app.post('/mentes', belepve, function(req, res) {
  var uj = req.body;
  baba(uj.azonosito, function(baba, meresek) {
    if (baba.szulo !== req.user.id) {
      res.status(403);
      res.send('A baba nem a felhasználóhoz tartozik.');
    } else {
      adatbazis(
        'INSERT INTO adatok (azonosito, datum, suly) VALUES ($1, $2, $3)',
        [uj.azonosito, uj.datum, uj.suly],
        function() { res.send('ok'); }
      );
    }
  });
});

app.post('/ujbaba', belepve, function(req, res) {
  var uj = req.body;
  var azonosito = req.user.id + '-' + uj.nev.replace(/\W/g, '-');
  adatbazis(
    'INSERT INTO babak VALUES ($1, $2, $3)',
    [azonosito, uj.nev, req.user.id],
    function() {
      res.send(JSON.stringify({ redirect: '/baba/' + azonosito }));
    }
  );
});

app.use(express.static(__dirname + '/public'));
app.listen(process.env.PORT || 8000);
