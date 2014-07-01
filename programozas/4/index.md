---
layout: programozas
title: Webszerver
comments: true
---

# Webszerver

Az előző leckében megnéztük, [hogyan tudunk reagálni egy gomb megnyomására](../3).
Be tudunk már vinni adatokat, de az oldal frissítésekor elvesznek.
Most megnézzük, hogyan futtathatunk egy szervert.
Ez valahol egy messzi adatközpontban fog futni napi 24 órában.
A weboldal a böngészőből ide küldi majd el az új adatokat, és innen kéri el őket, amikor megnyitják a weboldalt.

A fejlesztés ideje alatt egyszerűbb, ha a távoli adatközpont helyett a saját laptopunkon fut a szerver.
Fel kell ehhez telepítenünk egy programot.
Számtalan lehetőség közül én a [**Node.js**](http://nodejs.org/)-t mutatom be.
Ennek előnye, hogy ugyanolyan Javascriptet fogunk írni, mint ami a böngészőben fut.
És divatos is, tehát könnyen találunk választ bármilyen kérdésre.

Miután a Node.js-t feltelepítetted, hozz létre egy `package.json` fájlt, és írd bele ezt:

{% highlight javascript %}
{
  "dependencies": {
    "express": "*",
    "hjs": "*"
  }
}
{% endhighlight %}

Ezzel megmondjuk, hogy a Node.js-hez készült millió program közül nekünk mi kell.
Az _Express_ és a _Hogan.js_. (Mindjárt kiderül, melyik mire kell.)
Hogy feltelepítsd ezt a két csomagot, a terminálban futtasd ezt az egyszerű parancsot:

    npm install

Ez megnézi a `package.json` tartalmát, és letölti, amire szükség van. (Ha a jó könyvtárban futtattad.)

## Egy program

Kezdjük el megírni a szervert. Először csak próbáljuk ki, hogy minden működik-e. Egy `app.js` nevű fájlba írd ezt:

{% highlight javascript %}
console.log('Minden rendben.');
{% endhighlight %}

És futtasd le:

    node app.js

Ha minden rendben, akkor sikerült böngésző nélkül futtatni Javascriptet.
Ez nagyon hasznos -- most írhatnánk egy programot, ami megold egy egyenletet, vagy egyéb ravaszságot csinál.
De mi egy webszerverre vágyunk.

## Egy szerver

A webszerver a böngészőtől kapott kérésre válaszul visszaküld egy HTML fájlt. (Vagy CSS-t vagy akármit.)
Mi történik pontosan, amikor beírjuk egy weboldal címét, például `www.babaverseny.hu/baba/felix`?

- A böngésző kideríti, hogy az Interneten lévő számítógépek közül melyik a `www.babaverseny.hu`.
  Ezt egy nagy, közös adatbázisból kérdezi le, aminek _DNS_ a neve.
  Ebbe az adatbázisba csak pénzért lehet bekerülni, így biztosítják, hogy ne akarjon mindenki `www.facebook.com` lenni.
  Ezzel egyelőre nincs dolgunk.
- A `www.babaverseny.hu`-ért felelős szervernek a böngésző elküld egy `GET /baba/felix` kérést.
- A szerver visszaküld valamiféle tartalmat. (`<html>...</html>`)
- A böngésző megjeleníti a tartalmat, és lefuttatja a benne talált Javascriptet.

Tehát a célunk most az, hogy amikor a szerverünkhöz egy `GET /baba/felix` kérés érkezik, akkor visszaküldjük
a csodálatosan megtervezett HTML oldalunkat. De úgy, hogy a táblázat soraiba a megfelelő baba adatait illesszük be.

De haladjunk lépésenként. Először is egy szerver, ami köszön. Írd ezt az `app.js`-be:

{% highlight javascript %}
var express = require('express');
var app = express();
app.get('/', function(req, res) {
  res.send('<h1>Hello!</h1>');
});
app.listen(8000);
{% endhighlight %}

Betöltjük az _Express_ csomagot (`express` néven).
A csomag úgy viselkedik, mint egy függvény, és visszaad egy sokoldalú objektumot (amit `app`-nak keresztelünk).
Az `app.get('/', function...)` sor egy címhez egy függvényt rendel.
Amikor egy `GET /` kérés érkezik, ez a függvény fog lefutni. A `res.send(...)` elküldi válaszként a megadott tartalmat.

Az `app.listen(8000)` sor indítja el a szervert. Megkéri, hogy figyeljen a 8000-es porton. A "port" csak egy szám.
Azért vannak portok, hogy egy számítógépen több különböző szerver is futhatsson.
Indíthatsz egy másik szervert a 8001-es porton, ha akarsz, és békésen meglesznek egymás mellett.

A 8000-es porton futó szerver a böngészőből a `http://localhost:8000/` címen érhető el.
Jó esetben egy nagy "Hello!" feliratot látunk ezen a címen. (A `localhost` fixen a helyi géphez rendelt név, tehát
nem kell DNS regisztrációval bajlódjunk, ha csak a saját gépünkön kísérletezünk.)

Így már tudunk a szerveren adatokat tárolni. Például:

{% highlight javascript %}
var szamlalo = 0;
app.get('/', function(req, res) {
  szamlalo += 1;
  res.send('<h1>' + szamlalo + '. látogató</h1>');
});
{% endhighlight %}

Az `app.js` változtatása után ne felejtsd el újraindítani a szervert az új kóddal. A _Ctrl-C_ kombinációval le tudod
állítani és a `node app.js` paranccsal újra elindíthatod. A parancsot nem kell mindig újra beírni, csak nyomj egy
felfele gombot a terminálban.

## Egy template

Elég kényelmetlen lenne, ha a teljes HTML tartalmat be kéne másoljuk az `app.js`-be. Szerencsére nem kell.
A _statikus_ tartalmat (ami mindig ugyanaz) egyszerűen betehetjük egy könyvtárba, és az Express gondjaira bízzuk.

{% highlight javascript %}
app.use(express.static(__dirname + '/public'));
{% endhighlight %}

Ezután ha létrehozunk egy `public` nevű könyvtárat, és beletesszük a `babaverseny.css`-t, akkor a
`http://localhost:8000/babaverseny.css` címen el is érhetjük.

Ez hasznos, de nem megoldás a _dinamikus_ tartalomra, azokra az oldalakra, ahova valamilyen adatokat szeretnénk beszúrni.
Itt fordulunk a _Hogan.js_-hez. Hozz létre egy `views` könyvtárat.
Ezen belül egy `baba.hjs` fájlba másold be a korábban megtervezett weboldalt. (A HTML-t.) Valahova helyettesítsünk be valamit!

{% highlight html %}{% raw %}
<th>
  <p class="lead">{{neve}} testsúlya napról napra.</p>
</th>
{% endraw %}{% endhighlight %}

A `.hjs` kiterjesztésű HTML fájlban {% raw %}`{{` és `}}`{% endraw %} jelek között kijelölhetünk behelyettesítendő részeket.
Ezeket a szerver programban kell kitöltenünk, még mielőtt elküldenénk a látogató böngészőjébe.

{% highlight javascript %}
app.get('/baba/:azonosito', function(req, res) {
  res.render('baba.hjs', { neve: req.params.azonosito });
});
{% endhighlight %}

Tehát `res.send` helyett `res.render` kell, ha template-et akarunk használni, és az első paraméter a `.hjs` fájl neve,
a második paraméter pedig egy objektum, ami leírja, hogy hova mit szeretnénk behelyettesíteni.

Egy másik újdonság, hogy az URL-ből (a weboldal címéből) kiolvasunk egy azonosítót.
Ha az `app.get`-nek megadott útvonal egyik része kettősponttal kezdődik (`:azonosito`), akkor ott bármi lehet.
Például `http://localhost:8000/baba/felix`. És amit ott talál a szerver, azt megkapjuk a `req.params` objektumban.

Így most ha a `/baba/felix` oldalt nézzük, akkor azt látjuk, _"felix testsúlya napról napra"_.

## Adatok tárolása

Egyelőre tároljuk az adatainkat egy változóban.

{% highlight javascript %}
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
{% endhighlight %}

Ez már egy elég bonyolult objektum. A `babak` objektumnak egy tulajdonsága van, `babak.felix`, ami szintén egy objektum,
aminek két tulajdonsága van, `babak.felix.neve` és `babak.felix.meresek`. Az előbbi egy _string_ (szöveg), az utóbbi egy
_tömb_ (lista). A tömb elemei objektumok, amiknek két tulajdonsága van, `datum` és `meresek`.

Ha egy objektumnak úgy akarjuk elérni egy tulajdonságát, hogy csak menet közben (_futásidőben_) tudjuk a tulajdonság
nevét, akkor `babak.felix` helyett írhatjuk, hogy `babak[azonosito]`. A tömb elemeit is ilyen szögletes zárójelekkel
érhetjük el. Például az első mérés: `babak[azonosito].meresek[0].suly`.
(`[0]` a tömb első eleme, `[1]` a második, `[2]` a harmadik.)

A babát leíró objektum pont meg is felel a behelyettesítésre, mert van `neve` tulajdonsága.

{% highlight javascript %}
app.get('/baba/:azonosito', function(req, res) {
  var baba = babak[req.params.azonosito];
  res.render('baba.hjs', baba);
});
{% endhighlight %}

Még a méréseket kell valahogy behelyettesítsük.

{% highlight html %}{% raw %}
<table>
  {{#meresek}}
  <tr><td>{{datum}}</td><td>{{suly}} g</td></tr>
  {{/meresek}}
</table>
{% endraw %}{% endhighlight %}

{% raw %}
Itt a `<valami>...</valami>` szintaxishoz hasonlóan van egy nyitó (`{{#meresek}}`) és egy záró jelünk (`{{/meresek}}`).
Amit ezek között talál, azt a Hogan.js megismétli a megnevezett lista minden egyes elemére.
És a két jel között a lista elemeinek a tulajdonságaira is hivatkozhatunk. (`{{datum}}`, `{{suly}}`)
{% endraw %}

Már csak annyi van hátra, hogy a böngészőből el tudjuk küldeni az új mérési adatokat.

## Adatok mentése

Mikor megnyomjuk a beviteli oldalon a gombot, a `baba.hjs`-ben megírt `onsubmit` függvény fut le.
Ez beteszi az új sort a táblázatba. Most módosítjuk, hogy a szervernek is elküldje a mérést.

{% highlight javascript %}{% raw %}
function elkuld(adat) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/mentes');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(adat));
}

bevitel.onsubmit = function() {
  // ...

  var adat = { azonosito: '{{azonosito}}', datum: datum(), suly: meres() };
  elkuld(adat);
  return false;  // Maradjunk ezen az oldalon.
}
{% endraw %}{% endhighlight %}

Az új `elkuld` függvény elindít egy üzenetet a szerver felé. Nem várja meg, hogy visszaérkezzen a válasz.
Ezt úgy nevezzük, hogy _aszinkron_.

Sorról sorra mit csinál? Létrehoz egy `XMLHttpRequest` objektumot. Ezt használjuk a szerverrel való kommunikációra Javascriptben.
Megadjuk neki a címet a szerveren (`/mentes`), és hogy GET vagy POST kérést küldünk.
A GET való adatok kérésére (például egy weboldal betöltése), a POST pedig adatok küldésére (tipikusan amikor megnyomtunk egy gombot).

Ezután beállítjuk, hogy milyen formátumban küldjük az adatokat: `application/json`.
A JSON egy nagyon természetes formátum Javascriptben, mert egy `{x: 1, y: ['a', 'b']}` objektum JSON reprezentációja `{"x": 1, "y": ["a", "b"]}`,
vagyis szinte ugyanaz. A JSON forma is érvényes Javascript, csak kicsit szigorúbb (mindig kettős idézőjel van, a tulajdonságok
mindig idézőjelben vannak, és nem lehet vessző a felsorolások végén).
Az utolsó sor a paraméterként kapott objektumot átalakítja ilyen JSON formájú szöveggé, és elküldi a szervernek a megadott módon.

Az `onsubmit` függvényben az új sor létrehozása után elküldjük a mérést a szervernek is.
A dátum és a mérési eredmény mellett azt is meg kell adjuk, hogy melyik babához tartozik ez a mérés.
(A szerver csak annyit fog tudni, amennyit elküldünk neki.) A baba azonosítóját a template segítségével illesztjük az oldalba.

Ha most ezt kipróbáljuk, a böngésző Javascript konzoljában azt a hibaüzentet látjuk, hogy `404 (Not Found)`.
Ezt a választ küldi a szerver, mert nem tud semmiféle `/mentes` nevű dologról. Ez tehát a következő lépés.

Az Expresshez egy külön `body-parser` modul van, ami megkönnyíti a POST üzenetek fogadását.
A `package.json`-ban add hozzá a szükséges modulok listájához, majd az `npm install` paranccsal telepítsd.
Ezután még az `app.js`-ben is aktiválni kell:

{% highlight javascript %}
var bodyParser = require('body-parser');
app.use(bodyParser.json());
{% endhighlight %}

Egy egyszerű függvény regisztrálásával próbáld ki, hogy rendben megérkezik-e a mérési adat:

{% highlight javascript %}
app.post('/mentes', function(req, res) {
  console.log(req.body);
});
{% endhighlight %}

Most `app.post` van `app.get` helyett, és a `req` ("request") paraméter `body` tulajdonságában találjuk az elküldött objektumot.
Ez már egy rendes Javascript objektum a `body-parse` modulnak hála, tehát van `req.body.azonosito`, `req.body.datum` és `req.body.meres`.
Ezeket csak be kell tegyük a megfelelő helyre, és kész vagyunk!

{% highlight javascript %}
app.post('/mentes', function(req, res) {
  var uj = req.body;
  babak[uj.azonosito].meresek.unshift({ datum: uj.datum, suly: uj.suly });
});
{% endhighlight %}

Most az új mérés bevitele után a Javascript ugyanúgy létrehozza az új sort, mint eddig. De ha utána frissítjük az oldalt,
akkor is ott marad az új adat, mert elküldtük a szervernek, és visszaküldjük, amikor a böngésző újra kéri.

Az eddigieket ügyesen használva már készíthetsz olyan programokat, amik másoknak is hasznosak lehetnek.
Jó lenne, ha nem csak a laptopodon futnának, és nem csak te láthathatnád őket. 
A következő leckében leírom, [hogyan futtathatsz programokat egy adatközpontban](../5).
