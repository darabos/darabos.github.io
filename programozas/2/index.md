---
layout: programozas
title: HTML és CSS
---

# HTML és CSS

A HTML nyelven tudjuk leírni, hogy hogy nézzen ki egy weboldal. Hozz létre egy új fájlt, és írd bele:

{% highlight html %}
<h1>Babaverseny</h1>
A baba növöget.
{% endhighlight %}

Ha most ezt a fájlt megnyitod egy böngészőben, ezt fogod látni:

<iframe height="100" src="pelda-alap-html.html">iframe</iframe>

A HTML dokumentum többnyire szöveg, de úgynevezett _tagek_ jelölnek ki benne részleteket és módosítják ezeknek a megjelenését.
Például a `<h1>` tag egy címsort jelöl ki ("h1", mint "header 1").
A legtöbb tagnek van egy lezáró párja, mint a `<h1>`-nek a `</h1>`.
A két tag és köztük lévő dolgok együttes neve az _element_.
Ezeknek a neveknek csak annyi jelentősége van, hogy ügyesebben rá tudsz keresni egy kérdésre, ha meg tudod nevezni, mire gondolsz.

Még néhány tag gyors bevezetésével összerakjuk az adatbeviteli oldal alapjait.

{% highlight html %}
Most: <input>
<table>
  <tr><td>2014. június 4.</td><td>4000 g</td></tr>
  <tr><td>2014. május 4.</td><td>3400 g</td></tr>
</table>
{% endhighlight %}

Látszik, hogy az `<input>` tagnek nincs párja, a többinek viszont van.
A `<table>` egy táblázatot hoz létre. A táblázaton belül a `<tr>` jelöli ki a sorokat, a `<td>` pedig a soron belül az oszlopokat.

A fenti HTML kód most valahogy így fest a böngészőben:

<iframe height="100" src="pelda-tablazattal.html">iframe</iframe>

Szinte kész is vagyunk. Már csak annyi van hátra, hogy kicsit kicsinosítsuk a weboldalt. Design!
Itt jön a képbe a CSS, amivel megmondjuk, hogy a HTML elemek pontosan hogyan nézzenek ki.

{% highlight html %}
<style>
table.ritka td {
  padding-right: 5px;
  padding-left: 5px;
  background: lightskyblue;
  border-radius: 10px;
  font-family: sans-serif;
}
td.suly {
  font-size: 20pt;
}
</style>
<table class="ritka">
  <tr><td>2014. június 4.</td><td class="suly">4000 g</td></tr>
  <tr><td>2014. május 4.</td><td class="suly">3400 g</td></tr>
</table>
{% endhighlight %}

Itt két új jelenség van:

- Egyes elemeknek adtunk egy _attribútumot_. Ez a `class="ritka"` rész.
  Van rengeteg attribútum, de a `class` a legfontosabb.
- A másik újdonság a `<style>` elem. Ennek a tartalma nem jelenik meg szövegként az oldalon.
  A `<style>` elemben CSS szabályokat írunk. Ezekkel mondjuk meg, hogy melyik elem hogy nézzen ki.

A CSS-ben először megadjuk, hogy mire vonatkozik a szabály. Két szabályunk van a példában.
Az első a `ritka` osztályú `<table>` elemeken belüli `<td>` elemekre vonatkozik: `table.ritka td`.
A második a `suly` osztályú `<td>` elemekre: `td.suly`.

Aztán pedig kapcsos zárójelek között (`{}`) leírjuk, hogy hogy szeretnénk, hogy eltérjen a normálistól a megnevezett elem.
Például legyen jobbra és balra nagyobb hézag. Legyen hupikék. Legyen lekerekített a sarka. És talp nélküli betűket kérünk.
A súlyt tartalmazó mezők pedig legyenek nagyobb betűvel.

HTML, CSS és Javascript kérdésekben megbízható forrás az [MDN](https://developer.mozilla.org/en-US/).
(Például a [`font` leírása](https://developer.mozilla.org/en/docs/Web/CSS/font).)
De a legfontosabbakat én is igyekszem leírni.

A CSS hozzáadásával most így nézünk ki:

<iframe height="100" src="pelda-alap-css.html">iframe</iframe>

Bármilyen elképzelést meg lehet így valósítani, de sokszor ez egyáltalán nem egyszerű. Sokan abból élnek, hogy értenek hozzá.
Míg odáig eljutunk, kezdetben két módszert kell váltogassunk:

- Másolunk valahonnan.
- Addig variáljuk, amíg jó nem lesz.

Ezzel a technikával nekem ennyire futotta:

<iframe height="330" src="pelda-bootstrappel.html">iframe</iframe>

Ezzel rengeteg időt el lehet szöszölni, és a legegyszerűbb külső mögött is bonyolult kód lappang.
Nézzük darabonként, mit csináltam:

{% highlight html %}
<!DOCTYPE html>
<html lang="hu">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
    <title>Félix a Babaversenyen</title>
{% endhighlight %}

Ez a másolós rész. Hogy ne kelljen annyi mindent magunk megírnunk, a [Bootstrap](http://getbootstrap.com/) nevű CSS könyvtárat használjuk.
Ezt a részt szinte egyben a [Bootstrap példából](http://getbootstrap.com/getting-started/#template) másoltam.

Egy rendes HTML dokumentum valahogy így kezdődik.
Megmondjuk, hogy ez egy HTML dokumentum (`<!DOCTYPE html>`). Megmondjuk a nyelvét (`lang="hu"`).
Van egy `<html>` tag, azon belül pedig egy `<head>`, amibe különböző metaadatokat teszünk.
Megmondjuk, hogy mi a fájl kódolása (`charset="utf-8"`). Ez kell hozzá, hogy jól működjenek az ékezetes betűk.
Megmondjuk, hogy mobiltelefonok mit csináljanak az oldallal.
Betöltünk egy külső CSS fájlt (`href="..."`). És megadjuk az oldal címét (`<title>`).
Ez a cím jelenik meg a böngésző címsorában (vagy a fül tetején).

{% highlight html %}
    <style>
h1 {
  padding: 8px;
}
.testsuly th {
  font-weight: normal;
}
.testsuly .lead {
  margin-bottom: 0;
}
.testsuly td.lead {
  padding-left: 20px;
}
    </style>
  </head>
{% endhighlight %}

Egy pár dolgot azért ízlés szerint módosítottam, de nagyrészt a Bootstrapben megírt CSS szabályokra hagyatkozom.
A `.testsuly` azt jelenti, hogy bármilyen elem, ami `class="testsuly"`.

{% highlight html %}
  <body>
    <div class="navbar navbar-inverse navbar-static-top" role="navigation">
      <div class="container">
        <a class="navbar-brand" href="/">Babaverseny</a>
        <ul class="nav navbar-nav">
          <li class="active"><a href="#">Napló</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/kapcsolat">Kapcsolat</a></li>
        </ul>
        <ul class="nav navbar-nav navbar-right">
          <li><a href="/kijelentkezes">&#x238b; Kijelentkezés</a></li>
        </div>
      </div>
    </div>
{% endhighlight %}

Ez a fekete sáv az oldal tetején. A `<div>` elem nem csinál semmit magától, csak egy blokkot jelöl ki.
Ha beállítunk rajta egy osztályt (`class`), akkor CSS-sel meg tudjuk mondani, hogy nézzen ki.
A Bootstrap tele van ilyen osztályokra vonatkozó szabályokkal.
Így mi csak a Bootstrap dokumentációt forgatjuk és megpróbáljuk elérni, hogy jól nézzen ki a sáv.

A fenti részben látható az a tag is, aminek az Internet sikerét köszönhetjük.
Az `<a href="...">` tag egy linket jelöl ki.
A `/kapcsolat` cím azt jelenti, hogy ha a most látható oldal a `www.babaverseny.hu/baba/felix`,
akkor a link a `www.babaverseny.hu/kapcsolat` oldalra visz.

A titokzatos `&#x238b;` egy Unicode karaktert nevez meg (`⎋`).
Használhattam volna egy kis képet is, de nem volt kéznél jó kép.

{% highlight html %}
    <div class="container">
      <h1>Napló</h1>
      <table class="testsuly table table-hover">
        <thead>
          <tr>
            <th>
              <p class="lead">Félix testsúlya napról napra.</p>
            </th>
            <th>
              <form class="form-inline">
                <div class="form-group">
                  <div class="input-group" style="width: 200px">
                    <input class="form-control" placeholder="mai mérés">
                    <span class="input-group-btn">
                      <button class="btn btn-primary">&#x2b07;</button>
                    </span>
                  </div>
                </div>
                <div class="form-group">
                  <select class="form-control">
                    <option>most</option>
                    <option>tegnap</option>
                    <option>tegnapelőtt</option>
                  </select>
                </div>
              </form>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr><td>2014. június 4.</td><td class="lead">4000 g</td></tr>
          <tr><td>2014. május 4.</td><td class="lead">3400 g</td></tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
{% endhighlight %}

