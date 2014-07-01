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
