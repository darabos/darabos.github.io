---
layout: programozas
title: Grafikonok
comments: true
---

# Grafikonok

Az [előző leckében](../7) elkészültünk mindennel, ami a súlygyarapodás naplózásához kell.
Ha már van egy ilyen naplónk, természetes ötlet, hogy egy grafikonon is ábrázoljuk az adatokat.

Erre számtalan kész Javascript csomag létezik, de sajátot készíteni sem nehéz.
Én a [**Dygraphs**](http://dygraphs.com) csomag használatát mutatom be. Ez az egyik legrégibb
csomag, úgyhogy nem a leglátványosabb, de egyszerű a használata.

## Séma változtatás

Az adatbázisban eddig szöveges (`text`) mezőben tároltuk a dátumot is és a súlyt is.
Ez kicsit egyszerűsítette a munkánkat, de a felhasználó bevihette, hogy `hétfő délután` a baba
súlya `két dinnyényi` volt. Az ilyen adatokat nem tudjuk jól ábrázolni. Át kell térjünk a
dátum és a súly numerikus tárolására.

Egy adatbázis táblájának az alapvető megváltoztatását _séma változtatásnak_ nevezzük.
(Angolul _"schema change"_.) Ez nagyon egyszerű, ha még nincsenek igazi adataink:

    DROP TABLE adatok
    CREATE TABLE adatok (azonosito TEXT, datum BIGINT, suly BIGINT)

A `BIGINT` mezőben csak számokat fogunk tudni tárolni. A dátumot az "epoch" (1970 január 1) óta
eltelt másodpercek formájában fogjuk tárolni. (A számítógépek általában így tárolják a dátumot.)

Ha már vannak valódi adataink, nem dobhatjuk el őket csak azért, hogy megváltoztassuk a táblát.
Különösen nehéz a helyzet, ha a sémaváltoztatás ideje alatt is megbízhatóan kell a rendszernek
működnie. (TODO: leírni, hogy kell ezt csinálni)

## Dygraph

A `dygraph-combined.js` fájlt a `/public` könyvtárba kell tegyük. Ezt kell betölteni és egy
`div`et kell elhelyezni oda, ahol a grafikont látni szeretnénk. Én a napló táblázata fölé tettem:

{% highlight html %}
<div id="grafikon" style="width: 100%; height: 200px;"></div>
<script src="/dygraph-combined.js"></script>
{% endhighlight %}

Eddig a szerver az adatokat közvetlenül a táblázatba tette. Most egyrészt a dátumot számból át
kell alakítsuk emberi formára, másrészt a grafikonhoz is fel kell használjuk. Egyszerűbb ezért,
ha az adatokat Javascriptben kapjuk meg, és innen építjuk fel a grafikont és a táblázatot is.

Tehát a táblázat legyen üres induláskor:

{% highlight html %}
<tbody id="naplo">
</tbody>
{% endhighlight %}

És az adatokból építsünk egy Javascript változót a sablonban:

{% highlight javascript %}
var adatok = [
  {{#meresek}}
    { datum: {{datum}}, suly: {{suly}} },
  {{/meresek}}
  ];
{% endhighlight %}

Hogy könnyebben olvasható legyen a kód, tároljuk az adatokat időrend szerinti sorrendben. Eddig fordítva
voltak, úgyhogy most az `app.js`-en át kell írni az `ORDER BY datum DESC` részt `ORDER BY datum`-ra.

Kell egy függvény, ami a numerikus dátumból egy emberileg olvasható dátumot csinál:

{% highlight javascript %}
function formaz(datum) {
  return new Date(datum).strftime('%Y-%m-%d %H:%M:%S');
}
{% endhighlight %}

(Itt könnyen lehetne más formátumot is választani.)

Amikor betöltődik az oldal, létrehozzuk a táblázat sorait az `adatok`ból.

{% highlight javascript %}
function ujTR(datum, suly) {
  var tr = document.createElement('tr');
  tr.appendChild(ujTD(formaz(datum)));
  var m = ujTD(suly + ' g');
  m.classList.add('lead');
  tr.appendChild(m);
  return tr;
}

function betablaz() {
  var naplo = document.getElementById('naplo');
  while (naplo.firstChild) {
    naplo.removeChild(naplo.firstChild);
  }
  for (var i = 0; i < adatok.length; ++i) {
    var adat = adatok[i];
    naplo.insertBefore(ujTR(formaz(adat.datum), adat.suly), naplo.firstChild);
  }
}

window.onload = function() {
  betablaz();
};
{% endhighlight %}

A `window.onload` függvény az oldal betöltődésének a végén fut le.

A létrehozott sorokat a táblázat elejére szúrjuk be, így végül fordított sorrendben lesznek. Ez ízlés
kérdése, de szerintem praktikus így. Az újabb mérésekre inkább kíváncsi a felhasználó, mint a régiekre.

A `betablaz` függvény ki is törli a táblázat előző tartalmát a `while (naplo.firstChild)` ciklussal.
Ez azért kell, mert ezzel fogjuk frissíteni a táblázatot akkor is, amikor egy új elemet adunk hozzá.

{% highlight javascript %}
function datum() {
  var input = document.getElementById('datum');
  if (input.value === '') {
    return new Date().getTime();
  } else {
    return new Date(input.value).getTime();
  }
}

var bevitel = document.getElementById('bevitel');
bevitel.onsubmit = function() {
  adatok.push({ datum: datum(), suly: meres() });
  adatok.sort(function(a, b) { return a.datum - b.datum; });
  betablaz();

  // ... XMLHttpRequest kódja ...
};
{% endhighlight %}

> Az `<input type="date">` beállítással lehet takaros dátumválasztót is csinálni.

A `Date.getTime` függvény az epoch óta eltelt másodperceket adja meg. A `new Date` függvény paraméter nélkül a
mostani dátumot adja. Ha kap egy paramétert, akkor abból csinál dátumot. Elég intelligens -- ha csak egy évszámot
írnak be, az is működik, de be lehet írni szinte bármilyen formátumban másodpercre pontosan is a dátumot.

A `sort` függvény rendezi a tömböt. A paraméterül megadott függvény megmondja két elemről, hogy melyik kerüljön előbbre.
Negatív számot kell, hogy visszaadjon, ha az első, pozitívat ha a második. Ezért egy kivonással meg tudjuk oldani, hogy
dátum szerint rendezzük a tömböt növekvő sorrendben.

A korábbi változatban az új mérési eredmény mindig a táblázat tetejére került, akkor is, ha egy korábbi dátummal
vitték be. Most viszont mindig a helyére fog kerülni.

Már mindent csináltunk, csak grafikont nem. Erre írunk egy függvényt, ami a `betablaz`hoz hasonlít, és ahol azt
meghívjuk (`window.onload` és `bevitel.onsubmit`), ott ezt is meg kell hívjuk.

{% highlight javascript %}
function kirajzol() {
  var csv = 'Dátum,Testsúly\n';
  for (var i = 0; i < adatok.length; ++i) {
    var adat = adatok[i];
    csv += formaz(adat.datum) + ',' + adat.suly + '\n';
  }
  new Dygraph(document.getElementById('grafikon'), csv, { includeZero: true, fillGraph: true });
}
{% endhighlight %}

Excelből ismerős lehet a CSV formátum. A sorok újsor (`\n`) karakterrel vannak elválasztva, a mezők vesszővel (`,`).
Az első sor a fejléc. Ilyen formátumot vár a Dygraphs is.

A `new Dygraph` függvény első paramétere a `<div>`, ahol szeretnénk a grafikont. A második az adat, CSV formátumban.
A harmadik paraméterben különböző beállításokat adhatunk meg. Például milyen vastag legyen a vonal, milyen legyen
a színe, stb. Én csak annyit állítottam be, hogy nullától induljon az Y tengely és a vonal alatti terület legyen
kiszínezve. Súlynál az abszolút érték lényegesebb, mint a relatív változások.

TODO: iframe

A kapott táblázat máris sok mindent tud. Meg lehet nézni a mérési pontokon az értékeket.
Egérrel ki lehet nagyítani egy időszakot. A CSV táblázathoz még egy oszlopot hozzáadva össze tudnánk hasonlítani
két idősort. Ezt fogjuk a következő leckében felhasználni, hogy [összehasonlítsuk két baba adatait](../9).
