---
layout: programozas
title: Heroku
comments: true
---

# Heroku

Az előző leckében [írtunk egy webszervert](../4). Most megoldjuk, hogy a szerver ne csak a laptopunkon
fusson, és meg tudjuk mutatni mindenkinek.

Sok cég azzal foglalkozik, hogy számítógépeket ad bérbe az Interneten keresztül. Nagy a verseny közöttük
és annyira lenyomják az árakat, hogy mindegyik cégnél kaphatunk valamit ingyen.
A [Heroku](https://www.heroku.com/)nál ez 1 számítógép.
Ez most tökéletesen megfelel, tehát irány a regisztráció!
Amikor egy _Heroku Toolbelt_ letöltését kínálja, fogadd el és telepítsd fel azt is.

A Heroku használatához a kódunkat egy Git repository-ba kell tegyük. Mi sem egyszerűbb.

    git init
    git add .
    git commit -m 'Első commit.'

Az első paranccsal létrehoztunk egy üres repository-t.
A második paranccsal kiválasztottuk az összes fájlt a könyvtárunkban.
A harmadik paranccsal pedig elmentettük a változtatásunkat.
A `git status` parancsot bármikor lefuttathatod, és tájékoztat a pillanatnyi helyzetről.
(Mi van elmentve, mi nincs.)

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
Ország-világ láthatja a programunkat és vihet fel mérési eredményeket Félixhez. Az adatok egy
darabig megmaradnak, de ha újraindul a szerver, elvesznek. Abban nem bízhatunk, hogy sosem
fog újraindulni, hiszen amiatt is újraindítjuk, ha feltöltünk egy új változatot.

A következő leckében megnézzük, [hogyan kell az adatokat egy adatbázisban tárolni](../6).
