---
layout: programozas
title: Adatbázis
comments: true
---

# Adatbázis

Az előző leckében [írtunk egy webszervert](../3). Az weboldalon bevitt adatok már eljutnak a szerverhez,
csak a tárolásuk kérdéses.

Itt is sok választási lehetőségünk van. Én egy klasszikus SQL adatbázis használatát mutatom be.

Konkrétan egy PostgreSQL adatbázist fogunk használni. Ezt is telepíthetnénk a laptopra, és folytathatnánk
úgy a fejlesztést. De ugyanannyi (vagy kevesebb) erőfeszítéssel beüzemelhetünk egy olyan adatbázist, ami
nem a laptopon, hanem egy távoli adatközpontban fut. Erre úgyis szükség lesz, úgyhogy csak előnye van.

## Heroku

Sok cég azzal foglalkozik, hogy számítógépeket ad bérbe az Interneten keresztül. Nagy a verseny közöttük
és annyira lenyomják az árakat, hogy mindegyik cégnél kaphatunk valamit ingyen.
A [Heroku](https://www.heroku.com/)nál ez 1 számítógép és egy 10 000 soros adatbázis.
Ez most tökéletesen megfelel, tehát irány a regisztráció!
Amikor egy _Heroku Toolbelt_ letöltését kínálja, fogadd el és telepítsd fel azt is.

A Heroku használatához a kódunkat egy Git repository-ba kell tegyük. Mi sem egyszerűbb.

    git init
    git add .
    git commit -m 'Első commit.'

Az első paranccsal létrehoztunk egy üres repository-t.
A második paranccsal kiválasztottuk az összes fájlt a könyvtárunkban.
A harmadik paranccsal pedig elmentettük a változtatásunkat.

A Git egy verziókezelő rendszer, vagyis minden commithoz vissza tudunk menni később, meg tudjuk nézni
két commit között a különbséget, stb. A Herokutól függetlenül is nagyon hasznos megszokni.

Ha több fejlesztő dolgozik együtt, a Git használatával tudják koordinálni a munkát. Mindenki a
saját repository-jában dolgozik, és a `git push` paranccsal tudják egyik repository-ból a másikba
küldeni a változtatásokat. Ezt a mechanizmust használja a Heroku arra, hogy az adatközpontban futó
számítógépre másoljuk a programunkat.

    heroku create
    git push heroku master

Most a kódunk fent van Herokun, és kaptunk egy címet, ami valami értelmetlenség
(`http://frozen-plains-1234.herokuapp.com/`). De ha megnyitjuk a böngészőben, csak egy hibaüzenetet látunk.

A `heroku logs` paranccsal lekérhetjük a naplót, amiből látjuk, mi a baj. `No web processes running`, mondja.

Még két dolog kell a működéshez. Meg kell mondjuk, hogy hogy kell elindítani a programunkat, és meg
kell mondani, hogy hány számítógépen akarjuk elindítani.
Egy rendes webszerver mindig több számítógépen fut egyszerre, mert így ha az egyik elromlik nincs semmi gond.
De csak egyet kapunk ingyen, úgyhogy egyelőre beletörődünk a helyzetbe.

Hogy hogyan kell elindítani a szervert, azt egy új fájllal adjuk meg. A fájl neve kötelezően `Procfile`,
és a tartalma legyen:

    web: node app.js

Lehet többféle programunk Herokun, amik különböző név alatt futnak és különböző célt szolgálnak. A `web`
nevű program a webszerver, és most megadtuk, hogy a `node app.js` paranccsal kell elindítani.

Ezt a változtatást is töltsük fel Herokura:

    git add Procfile
    git commit -m 'Procfile hozzáadása.'
    git push heroku master

És indítsunk el a `web` programot egy számítógépen:

    heroku ps:scale web=1

Most a weboldalt megnyitva csak várunk és nem jön be semmi. Nézzük a naplót.

     Web process failed to bind to $PORT within 60 seconds of launch

A Heroku rendszer elindítja a programot, majd vár egy percig, hogy elkezd-e működni.
Úgy látja, hogy nem, mert a mi szerverünk a 8000-es portot használja, a Heroku viszont megadja egy
másik port számát a `PORT` nevű _környezeti változóban_, és ezen a porton keresi a webszervert.

Gyorsan javítsuk ki az `app.js`-ben:

{% highlight javascript %}
app.listen(process.env.PORT || 8000);
{% endhighlight %}

A `||` azt jelenti, _vagy_. Az `a || b` azt jelenti, hogy ha `a` "igaz" (vagyis létezik és
nem nulla, nem üres string), akkor `a`, egyébként `b`. Így ha definiálva van `PORT` nevű
környezeti változó, akkor azt használjuk, egyébként a 8000-es portot.

Újabb commit és push után végre működik a `http://frozen-plains-1234.herokuapp.com/baba/felix`.

---

Azért kezdtünk bele az egészbe, hogy egy adatbázisunk legyen, tehát indítsuk el azt is:

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
client = new pg.Client(process.env.DATABASE_URL);
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

    SELECT datum, suly FROM adatok WHERE azonosito = 'felix'

A bevitel parancsa:

    INSERT INTO adatok VALUES ('felix', '2014-07-02', '5000')

Írjuk át az `app.js`-t, hogy a saját `babak` változónk helyett ezekkel a parancsokkal az adatbázist használja.

{% highlight javascript %}
var pg = require('pg');
client = new pg.Client(process.env.DATABASE_URL);
client.connect();
{% endhighlight %}
