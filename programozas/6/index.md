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

A fenti sor létrehozza a táblát, amit szeretnénk. De hogy futtassuk le? Előbb csatlakoznunk kell az
adatbázishoz. Írjunk erre egy Node.js programot, mondjuk `create.js` néven.

{% highlight javascript %}
var pg = require('pg');
var client = new pg.Client(process.env.DATABASE_URL);
client.connect();
var query = client.query('CREATE TABLE adatok (azonosito TEXT, datum TEXT, suly TEXT)');
query.on('end', function() { client.end(); });
{% endhighlight %}

Egy új modulra van szükség (`pg`). Ezt is tedd a `package.json`-ba és futtass `npm install`-t.
A porthoz hasonlóan az adatbázis címében is arra hagyatkozunk, hogy a Heroku beállítja majd a
`DATABASE_URL` környezeti változót. Csatlakozás után lefuttatjuk a kiszemelt parancsot.
Ha lefutott, bezárjuk a kapcsolatot. (Enélkül sose lépne ki a program.)

Ezt a programot a `node create.js` paranccsal tudjuk futtatni. De a saját gépünkön nem fog működni.
A Heroku rendszerben kell lefuttassuk. Tehát `git add .`, `git commit -m 'create.js'`, `git push heroku master`.
Majd:

    heroku run node create.js

Ez lefuttatja a programot. Ha minden rendben ment, nem ír ki semmit.
Hogy megbizonyosodj a sikerről, lefuttathatod mégegyszer.
Most hibaüzenetet fogsz kapni: `error: relation "adatok" already exists`. A tábla létezik!

## Lekérdezés és bevitel

A lekérdezés parancsa:

    SELECT datum, suly FROM adatok WHERE azonosito = 'felix' ORDER BY datum DESC

A bevitel parancsa:

    INSERT INTO adatok VALUES ('felix', '2014-07-02', '5000')

Írjuk át az `app.js`-t, hogy a saját `babak` változónk helyett ezekkel a parancsokkal az adatbázist használja.
A program indulásakor kapcsolódnunk kell az adatbázishoz:

{% highlight javascript %}
var pg = require('pg');
client = new pg.Client(process.env.DATABASE_URL);
client.connect();
{% endhighlight %}

Mentéskor az `INSERT INTO` parancsot futtatjuk le:

{% highlight javascript %}
app.post('/mentes', function(req, res) {
  var uj = req.body;
  var query = client.query('INSERT INTO adatok VALUES ($1, $2, $3)', [uj.azonosito, uj.datum, uj.suly]);
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
  var query = client.query('SELECT datum, suly FROM adatok WHERE azonosito = $1 ORDER BY datum DESC', [req.params.azonosito]);
  var sorok = [];
  query.on('row', function(sor) {
    sorok.push(sor);
  });
  query.on('end', function() {
    res.render('baba.hjs', { azonosito: req.params.azonosito, neve: req.params.azonosito, meresek: sorok });
  });
});
{% endhighlight %}

A `SELECT` parancsnak lehet, hogy borzasztóan sok eredménye van. Ezért nem egyszerre kapjuk meg mindet, hanem soronként.
A `query.on('row', f)` paranccsal megadunk egy függvényt, ami fogadja a sorokat. Ezeket egyszerűen betesszük egy tömbbe.
A `query.on('end', f)` paranccsal megadunk egy függvényt, ami az utolsó sor után kell, hogy lefusson.
Ebben a függvényben helyettesítjük be a Hogan.js template-be a tömbben összegyűjtött mérési eredményeket.

Ezekkel a változtatásokkal már működnie kell a programnak. Ha mégsem működik, a `heroku logs` paranccsal nézhetjük meg
a naplókat. Itt jó esetben láthatunk valamit, de magunk is írhatunk a naplóba. Ajánlott az SQL hibákat a naplóba írni:

{% highlight javascript %}
  query.on('error', function(hiba) {
    console.log(hiba);
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
