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

Ez a másolós rész. A [Bootstrap](http://getbootstrap.com/) nevű CSS könyvtárat használjuk.
Ezt a részt szinte egyben a [Bootstrap példából](http://getbootstrap.com/getting-started/#template) másoltam.

Egy rendes HTML dokumentum valahogy így kezdődik.
Megmondjuk, hogy ez egy HTML dokumentum (`<!DOCTYPE html>`). Megmondjuk a nyelvét (`lang="hu"`).
Van egy `<html>` tag, azon belül pedig egy `<head>`, amibe különböző metaadatokat teszünk.
Megmondjuk, hogy mi a fájl kódolása (`charset="utf-8"`). Ez kell hozzá, hogy jól működjenek az ékezetes betűk.
Megmondjuk, hogy mobiltelefonok mit csináljanak az oldallal.
Betöltünk egy külső CSS fájlt (`href="..."`). És megadjuk az oldal címét (`<title>`).
Ez a cím jelenik meg a böngésző címsorában (vagy a fül tetején).

