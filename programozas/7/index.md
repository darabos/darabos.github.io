---
layout: programozas
title: Felhasználók
comments: true
---

# Felhasználók

Az előző leckében [sikerült a mérési adatokat egy adatbázisban tárolni](../6). Csak annyi a gond,
hogy mindenki minden adathoz hozzáfér. Most megoldjuk, hogy mindenki csak a saját babája adatait
tudja módosítani.

Régen minden weboldalon külön kellett regisztrálni, az ember mindenhol megadta ugyanazt a jelszót,
és ha a száz weboldal közül egynek betörtek a rendszerébe és megszerezték a jelszavunkat, akkor
a másik kilencvenkilencbe is be tudtak lépni a nevünkbne.

Ma kicsit jobb a helyzet, mert sok helyen Facebook, Twitter vagy Google felhasználónkkal tudunk
belépni. A felhasználónak könnyebb, gyorsabb, biztonságosabb, és nekünk sem kell saját felhasználói
azonosító rendszert fejlesztenünk. A [Facebookos belépés](https://developers.facebook.com/products/login/)
a legelterjedtebb, úgyhogy én is ezt választom.

Hogy ezt be tudjuk üzemelni, meg kell ismernünk néhány technikát először.

## Redirect

A szerver a GET kérésre válaszul általában elküldi a kért tartalmat (HTML, CSS, kép, akármi).
De ehelyett adhat más választ is. Például a szerver túlterhelt, a kért tartalom nem létezik,
vagy létezik, de máshol van. Ez az utóbbi válasz a _redirect_, vagyis átirányítás egy másik
címre. Ilyenkor a böngésző átírja a címet a címsorban, és egy új GET requestet küld. Az új
cím mutathat akár egy másik szerverre is.

(A különböző válaszlehetőségeket [HTTP státusz kódoknak](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes) hívjuk.)

{% highlight javascript %}
app.get('/innen', function(req, res) {
  res.redirect('/ide');
});
{% endhighlight %}

Ezt arra fogjuk használni, hogy ha valaki nincs belépve, átirányítjuk a Facebook egy speciális
oldalára, ami azonosítja a felhasználót (be is lépteti, ha nincs Facebookra belépve), majd
visszaküldi hozzánk egy újabb átirányítással. Ezzel az átirányítással tudja a Facebook átadni
nekünk a felhasználó adatait.

## Cookie

Egy webszervernek nincs folyamatos kapcsolata a felhasználóval. Ha két felhasználó egyszerre böngészi
a weboldalunkat, a szerver csak független HTTP kérések sorozatát látja tőlük. Honnan tudhatja, hogy melyik
kérés melyik felhasználótól jött?

Ezt a problémát oldják meg a cookie-k.

A szerver a GET kérésre adott válaszában a tartalom előtt metaadatok (_header_) sorozatát
is elküldi. Ezek megmondják, milyen hosszú a tartalom (`Content-Length`), milyen típusú (`Content-Type`),
mikor frissült utoljára (`Last-Modified`), stb. Az egyik ilyen header a `Set-Cookie`.

A `Set-Cookie` header megkéri a böngészőt, hogy tároljon el egy kicsi adatot. Például jegyezze meg, hogy
`felhasználó = bejus79`. Amikor a böngésző később ugyanennek a szervernek küld egy kérést, visszaküldi
az összes cookie-t, amit a szerver beállított. (A kérésben szintén vannak headerek, és a `Cookie`
headerben küldi vissza a cookie-k tartalmát.)

Ezt a mechanizmust használhatjuk felhasználók azonosítására. Amikor valaki belép, beállítunk neki egy
cookie-t, és a későbbi kéréseinél tudni fogjuk, hogy kitől jött a kérés. Ez egyszerű, csak könnyen lehet
vele csalni. A cookie-t a böngésző tárolja a felhasználó számítógépén. Nem áll semmiből a felhasználónak
módosítania a cookie tartalmát (`felhasználó = rendszergazda`).

A `cookie-parser` modullal könnyen beállíthatunk és kiolvashatunk cookie-kat:

{% highlight javascript %}
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.get('/belepes/:felhasznalo', function(req, res) {
  res.cookie('felhasznalo', req.params.felhasznalo);
  res.redirect('/valami');
});
app.get('/valami', function(req, res) {
  res.send('felhasználó: ' + req.cookies.felhasznalo);
});
{% endhighlight %}

Amikor a felhasználó megnyitja a `/belepes/bela` oldalt, a szervertől válaszul egy weboldal helyett két
utasítást kap: tárolja el, hogy `felhasznalo=bela`, és menjen a `/valami` oldalra. Ezeket az utasításokat
a böngészők automatikusan végrehajtják. De a felhasználó nagyon könnyen küldhet módosított cookie-kat is,
például ezzel a paranccsal:

    curl -b felhasznalo=superman http://localhost:8000/valami

## Session

A cookie meghamisításának problémáját oldja meg a _session_. A felhasználó aktuális látogatásához
("session") kapcsolódó adatokat cookie helyett az adatbázisunkban tároljuk. Csak egy _session azonosítót_
tárolunk cookie-ban, és megoldjuk, hogy ezt ne igazán lehessen meghamisítani. A session cookie védelmére
az a megoldás, hogy egy nagyon nagyon nagy véletlen számot választunk azonosítónak. Ha valaki meg akarna
tippelni egy érvényes azonosítót, egymillió évig tippelgethetne, míg találna egy érvényeset.

Hasonló, de bonyolultabb kriptográfiai eszközökkel elérhető, hogy egy cookie tartalmát se lehessen meghamisítani.
Ez lehetővé teszi, hogy a sessionhöz tartozó adatokat mégis egy cookie-ban tároljuk el.

Az Expressben az `express-session` modul biztosítja a sessionök kezelését.
Külön kell hozzá választanunk egy "session store"-t, ami valamilyen adatbázisban tárolja a session adatokat.
Létezik egy PostgreSQL session store (`postgres-session`), de négy éve nem nyúlt hozzá senki, így nem biztos,
hogy működik a többi modul friss változatával.

`express-session` helyett használjuk inkább a `cookie-session` modult, ami egy cookie-ban tárolja digitálisan
aláírva a session adatokat.

{% highlight javascript %}
var session = require('cookie-session');
app.use(session({ secret: 'titok' }));
app.get('/belepes/:felhasznalo', function(req, res) {
  req.session.felhasznalo = req.params.felhasznalo;
  res.redirect('/valami');
});
app.get('/valami', function(req, res) {
  res.send('felhasználó: ' + req.session.felhasznalo);
});
{% endhighlight %}

Ez nagyon hasonlít az előző cookie-s példához. Mivel a `cookie-session` modult használjuk `express-session`
helyett, még abban is megegyzetnek, hogy mindkét esetben egy cookie-ban, a felhasználó böngészőjében
tároljuk el a felhasználó azonosítóját. Az a különbség, hogy most az azonosítót digitálisan aláírva tároljuk,
így a `/valami` kezelőjében biztosak lehetünk benne, hogy az van a cookie-ban, amit a `/belepes` kezelőjében
a sessionhöz rendeltünk.

A legtöbb böngészőben meg lehet nézni, hogy milyen headert küldtünk és milyet kaptunk egy webszervertől.
(Chrome-ban ezt a _Developer Tools_ _Network_ fülén találjuk, ha ráklikkelünk egy kérésre.)
A kapott header most így néz ki:

    Set-Cookie:express:sess=eyJmZWxoYXN6bmFsbyI6ImRhbmkifQ==; path=/; httponly
    Set-Cookie:express:sess.sig=kz4b2OFYVR1VJMA_2B8DdCTmfJY; path=/; httponly

Az `express:sess` cookie tárolja a session adatokat _base-64_ kódolásban. Ezt a böngésző Javascript konzoljában
könnyen dekódolhatjuk.

{% highlight javascript %}
> atob('eyJmZWxoYXN6bmFsbyI6ImRhbmkifQ==')
'{"felhasznalo":"dani"}'
{% endhighlight %}

Az `express:sess.sig` cookie a hozzá tartozó aláírás. A szerverünk aláírja az `express:sess` cookie tartalmát
a megadott titkos kulccsal (a `secret` paraméter). Ha ez nem egyezik meg az `express:sess.sig` cookie tartalmával,
akkor érvénytelen a session. (Ezekkel a cookie-kkal nincs mit tennünk gyakorlatban. Csak a jobb megértés
érdekében írtam le a működésüket.)

Így most már ha egy felhasználóról egyszer megtudjuk, hogy kicsoda, onnantól a sessionben biztonságosan meg
tudjuk őrizni ezt az adatot, és nem kell minden oldalon újra és újra beléptetnünk.
Már csak azt kell megoldanunk, hogy egyszer megtudjuk, kicsoda a felhasználó.

## Facebook

Hogy a felhasználók Facebookkal be tudjanak hozzánk lépni, be kell regisztrálni a weboldalunkat
a https://developers.facebook.com/apps/ oldalon. Megkérdezi, hogy milyen felhasználói adatokhoz akarunk
hozzáférni. Semmilyenhez. Végül kapunk egy alkalmazás azonosítót (_App ID_) és egy jelszót (_App Secret_).
Erre a kettőre lesz szükség a felhasználók azonosításához.

A `passport` nevű modult használjuk. Ez nem csak a Facebookos belépést teszi könnyűvé, de Google, Twitter és
minden más accountot is támogat. Mindegyik nagyjából ugyanúgy működik. A Passport a felhasználó identitását
a sessionben teszi elérhetővé, ezért a `cookie-session` modullal együtt kell használnunk.

{% highlight javascript %}
var session = require('cookie-session');
var passport = require('passport')
var titok = process.env.TITOK;
app.use(session({ secret: titok }));
app.use(passport.initialize());
app.use(passport.session());
{% endhighlight %}

A Facebooktól kapott titkot semmiképp se tedd a program kódjába. Egyszerű megoldás inkább egy környezeti
változóban tartani. A változót pedig így lehet beállítani:

    heroku config:set TITOK=01234567890123456789

Facebookos beállítások:

{% highlight javascript %}
var facebook = require('passport-facebook');
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
{% endhighlight %}

A `clientID` és a `clientSecret` a Facebookos alkalmazás azonosítója és jelszava.
A `callbackURL` az a cím, ahova szeretnénk, hogy a Facebook visszairányítsa a látogatót.
A megadott függvény a Facebooktól kapott felhasználói profilt saját rendszerünk felhasználói
profiljává alakítja. Itt tehetnénk be a felhasználót a saját adatbázisunkba. De egyelőre
nem tárolunk magunk semmit, csak átvesszük a Facebook profilt.

Meg kell adnunk azt is, hogy a felhasználót hogyan mentse a Passport a sessionbe, és
onnan hogyan töltse vissza.

{% highlight javascript %}
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
{% endhighlight %}

Itt is a lehető legegyszerűbb megoldással élünk, a felhasználói profilt ahogy van betesszük
a sessionbe. Így könnyű kivenni is. (Megtehetnénk, hogy csak egy azonosítót
tárolunk a sessionben, és az adatbázisunkból vesszük a részleteket.)

