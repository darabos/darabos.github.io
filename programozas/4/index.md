---
layout: programozas
title: Web szerver
comments: true
---

# Web szerver

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
De mi egy web szerverre vágyunk.

## Egy szerver

A web szerver a böngészőtől kapott kérésre válaszul visszaküld egy HTML fájlt. (Vagy CSS-t vagy akármit.)
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

{% highlight html %}
<th>
  <p class="lead">{{baba_neve}} testsúlya napról napra.</p>
</th>
{% endhighlight %}

A `.hjs` kiterjesztésű HTML fájlban `{{` és `}}` jelek között kijelölhetünk behelyettesítendő részeket.
Ezeket a szerver programban kell kitöltenünk, még mielőtt elküldenénk a látogató böngészőjébe.

{% highlight javascript %}
app.get('/baba/:azonosito', function(req, res) {
  res.render('baba.hjs', { baba_neve: req.params.azonosito });
});
{% endhighlight %}

Tehát `res.send` helyett `res.render` kell, ha template-et akarunk használni, és az első paraméter a `.hjs` fájl neve,
a második paraméter pedig egy objektum, ami leírja, hogy hova mit szeretnénk behelyettesíteni.
