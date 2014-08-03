---
layout: programozas
title: Adatbázis
comments: true
---

# Adatbázis

Az előző leckében [sikerült Herokun futtani a szerverünket](../5). Már nem kell a laptopunknak
bekapcsolva lennie, hogy mérési adatokat bevihessünk. De gond még, hogy elvesznek, ha újraindul a
szerver. Ennél maradandóbb módon kell tároljuk őket.

Itt is sok választási lehetőségünk van. Én egy klasszikus SQL adatbázis használatát mutatom be.

Konkrétan egy PostgreSQL adatbázist fogunk használni. Ezt is telepíthetnénk a laptopra, és folytathatnánk
úgy a fejlesztést. De Herokun kapunk egy 10 000 soros ingyenes adatbázist. Ez elég lesz, amíg csak
néhány baba adatairól van szó.

Csak egy parancsba kerül aktiválni ezt az adatbázist:

    heroku addons:add heroku-postgresql

## Egy tábla

Egy adatbázis _tábla_ olyan, mint egy Excel munkalap. Azzal a különbséggel, hogy a fejlécet előre
rögzítenünk kell, és szigorúan csak azok az oszlopok vannak, amiket kértünk, nincs mellettük üres hely.

Nekünk egy olyan tábla kell, aminek három oszlopa van: azonosító, dátum, súly.

    CREATE TABLE adatok (azonosito TEXT, datum TEXT, suly TEXT)

Az SQL is egy programozási nyelv, kifejezetten adatbázisokhoz. Adatbázis műveleteket és lekérdezéseket
tudunk vele leírni. A nyelv alap elemeit (mint `CREATE TABLE`) nagybetűvel szokás írni, de nem
kötelező.

A fenti sor létrehozza a táblát, amit szeretnénk. De hogy futtassuk le?
Írjunk egy Node.js programot, ami egyszerűen lefuttat egy SQL parancsot. Legyen mondjuk `sql.js` a neve.

{% highlight javascript %}
var parancs = process.argv[2];
var pg = require('pg');
pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  var query = client.query(parancs, function(err, result) {
    done();
    console.log(err || result.rows);
  });
});
pg.end();
{% endhighlight %}

Az SQL parancsot a parancssorról vesszük. Ez a `process.argv[2]`.
Ha a `node sql.js "CREATE TABLE"` sorral futtatjuk a programot, a `process.argv` lista
három eleme `'node'`, `'sql.js'` és `'CREATE TABLE'` lesz.

> A program folyása most elég összetett. A `pg.connect` és a `client.query` függvények is egy-egy
callback függvényt vesznek paraméterül. Az egyik callback egy másik callbacket (`done`) kap paraméteréül.
Ez tipikus a Node.js-ben, és a célja az, hogy a kód sehol se álljon meg. A `client.query` lekérdezés
tarthat sokáig, de a programunk közben csinálhat mást, nem ragad meg egy sorban amíg vár.

Egy új modulra is szükség van (`pg`). Ezt is tedd a `package.json`-ba és futtass `npm install`-t.
A porthoz hasonlóan az adatbázis címében is arra hagyatkozunk, hogy a Heroku beállítja majd a
`DATABASE_URL` környezeti változót. A `pg.connect` paranccsal kérünk egy adatbázis klienst.
Mikor ezt megkapjuk, lefuttatjuk az SQL parancsot. Mikor ez lefutott, "visszaadjuk" a klienst (ez a `done()`),
majd kiírjuk a hibát, vagy a lekérdezés eredményét.
A `pg.end()` azt mondja, lépjünk ki a programból, ha már nincs egy kliens se használatban. (Enélkül sose lépne ki a program.)

Ezt a programot a `node sql.js "CREATE TABLE ..."` paranccsal tudjuk futtatni. De a saját gépünkön nem fog működni.
A Heroku rendszerben kell lefuttassuk. Tehát `git add .`, `git commit -m 'create.js'`, `git push heroku master`.
Majd:

    heroku run node sql.js '"CREATE TABLE adatok (azonosito TEXT, datum TEXT, suly TEXT)"'

Ez lefuttatja a programot a Heroku egy számítógépén. Ha minden rendben ment, annyit ír ki, hogy `[]`.
(Üres az eredmény, mert ez nem egy lekérdezés volt.) Hogy megbizonyosodj a sikerről, lefuttathatod mégegyszer.
Most hibaüzenetet fogsz kapni: `error: relation "adatok" already exists`. A tábla létezik!

## Lekérdezés és bevitel

A lekérdezés parancsa:

    SELECT datum, suly FROM adatok WHERE azonosito = 'felix' ORDER BY datum DESC

A bevitel parancsa:

    INSERT INTO adatok VALUES ('felix', '2014-07-02', '5000')

Írjuk át az `app.js`-t, hogy a saját `babak` változónk helyett ezekkel a parancsokkal az adatbázist használja.
Szükség lesz ehhez is a `pg` modulra.

{% highlight javascript %}
var pg = require('pg');
{% endhighlight %}

Mentéskor az `INSERT INTO` parancsot futtatjuk le:

{% highlight javascript %}
app.post('/mentes', function(req, res) {
  var uj = req.body;
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var query = client.query(
      'INSERT INTO adatok VALUES ($1, $2, $3)',
      [uj.azonosito, uj.datum, uj.suly],
      function() { done(); }
    );
  });
});
{% endhighlight %}

Az SQL parancsot egyfajta template-tel írjuk le, amiben a `$1`, `$2`, `$3` jelek helyére a program behelyettesíti
a listában megadott változókat. Erre azért van szükség, hogy elkerüljük az _"SQL injection"_ támadásokat.
Például ha súlynak azt adja meg valaki, hogy `"1"); DROP TABLE adatok; --`, és ezt egyenesen behelyettesítjük a
parancsunkba, abból az lesz, hogy rögzítünk egy 1 gramos mérést, majd letöröljük az `adatok` táblát.
A template-es behelyettesítésnél a program gondosan elkerüli ezeket a veszélyeket.

Az elmentett adatokat pedig a `SELECT` paranccsal kérjük vissza az adatbázisból:

{% highlight javascript %}
app.get('/baba/:azonosito', function(req, res) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var query = client.query(
      'SELECT datum, suly FROM adatok WHERE azonosito = $1 ORDER BY datum DESC',
      [req.params.azonosito],
      function(err, res) {
        done();
        res.render(
          'baba.hjs',
          { azonosito: req.params.azonosito, neve: req.params.azonosito, meresek: res.rows }
        );
      }
    );
  });
});
{% endhighlight %}

Itt a lekérdezés végrehajtása után a Hogan.js template-be helyettesítjük be a mérési eredményeket.

Ezekkel a változtatásokkal már működnie kell a programnak. Ha mégsem működik, a `heroku logs` paranccsal nézhetjük meg
a naplókat. Itt jó esetben láthatunk valamit, de magunk is írhatunk a naplóba a `console.log` és `console.error` függvényekkel.
Írjunk is egy függvényt, ami gondoskodik a kliens kikéréséről és visszaadásáról, és naplózza az SQL hibákat:

{% highlight javascript %}
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
{% endhighlight %}

Ezzel valamivel takarosabb lesz az `INSERT` és `SELECT` parancsok futtatása:

{% highlight javascript %}
app.post('/mentes', function(req, res) {
  var uj = req.body;
  adatbazis('INSERT INTO adatok VALUES ($1, $2, $3)', [uj.azonosito, uj.datum, uj.suly]);
});

app.get('/baba/:azonosito', function(req, res) {
  adatbazis(
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
{% endhighlight %}

Ha sikerül minden hibát elhárítani, az adataink biztonságban vannak.
A programunk _skálázhatóbb_ is lett. Most futtathatunk több gépen egy-egy webszervert, és ugyanazokat az adatokat
fogják látni, mert ugyanabból az adatbázisból olvassák őket. Így működik minden megbízható weboldal. Egy "load balancing"
rendszer elosztja a beérkező kéréseket a webszerverek között, és mindegy melyikhez megy, ugyanúgy tudnak válaszolni.
És ha egy gép meghibásodik, a többi gép még mindig elég, hogy kiszolgálja a látogatókat.

Annyi gond van csak a mostani programunkkal, hogy bárki felvihet adatokat bármelyik babához.
Mielőtt népszerűsíteni kezdjük az oldalt, meg kell tanuljuk, [hogyan tudunk felhasználókat azonosítani](../7).
Erről szól a következő lecke.
