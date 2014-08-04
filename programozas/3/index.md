---
layout: programozas
title: Javascript
comments: true
---

# Javascript

Az előző leckében megnéztük, [hogyan kell csinos gombokat és beviteli mezőket csinálni](../2).
Ha eltekintünk a csinosítástól, a lényeg ez:

{% highlight html %}
<input placeholder="mai dátum">
<input placeholder="mai mérés">
<button>Mentés</button>
<table>
  <tr><td>2014. június 4.</td><td>4000 g</td></tr>
  <tr><td>2014. május 4.</td><td>3400 g</td></tr>
</table>
{% endhighlight %}

És (kicsit csinosítva) így néz ki:

<iframe height="150" src="source/pelda-csak-html.html">iframe</iframe>

Most azt szeretnénk, hogy ha beírunk valamit és elmentjük, az egy új sorban a táblázat tetejére kerülne.

Az első lépés, hogy mindennek azonosító nevet adunk, amire hivatkozni szeretnénk.

{% highlight html %}
<form id="bevitel">
  <input placeholder="mai dátum" id="datum">
  <input placeholder="mai mérés" id="meres">
  <button>Mentés</button>
</form>
<table id="naplo">
  <tbody>
    <tr><td>2014. június 4.</td><td>4000 g</td></tr>
    <tr><td>2014. május 4.</td><td>3400 g</td></tr>
  </tbody>
</table>
{% endhighlight %}

Az `id` attribútum hasonlóan működik, mint a `class`.
Nincs semmi közvetlen hatása, de lehetővé teszi, hogy hivatkozzunk a megjelölt elemre.
A `class` elemek egy csoportjának ad nevet, az `id` pedig egy bizonyos elemnek.
Az `id` szerint is írhatunk CSS szabályokat: `table#naplo { ... }`.

A `<body>` elem végére pedig egy `<script></script>` elem belsejébe elkezdünk Javascriptet írni.
Ez hasonlóan a CSS-hez egy HTML-be ágyazott másik nyelv. (Mint a CSS-t, a Javascriptet is lehet külön fájlba is tenni.)

## Hello Javascript

Kezdetnek csak írjuk ki, hogy `hello`, ha megpróbálják elmenteni az adatokat.

{% highlight javascript %}
var bevitel = document.getElementById('bevitel');
bevitel.onsubmit = function() {
  alert('hello');
  return false;  // Nem küldjük az adatokat sehova.
};
{% endhighlight %}

Itt minden új. Míg a HTML egy dokumentumot ír le, a CSS pedig egyes elemek stílusát, addig Javascriptben egy programot írunk.
Vagyis minden sor egy utasítás a számítógépnek. Tedd ezt, tedd azt.
Ezek a sorok szépen egymás után hajtódnak végre, mint egy recept lépései.

Gyorsan elmagyarázok pár dolgot az ilyen programokkal kapcsolatban. Ezek a legtöbb programnyelvre igazak, nem csak a Javascriptre.

- **A változók** saját kis adattárolóink. Ha azt mondom, `x = 3`, akkor most `x` értéke 3.
  Ezután mondhatom, hogy `y = 2 * x`, és most `y` értéke 6.
  Ha most azt mondom, `x = 5`, akkor `x` értéke megváltozott, de `y` értéke maradt 6.

  Vagyis ez nem matematika, hanem egy recept. _"Ezt tegyük ide, aztán azt tegyük oda, stb."_

  Javascriptben egy új változtót a `var` szóval vezetünk be. Például `var x = 3`.

- **A függvények** kis alprogramok.
  A receptes hasonlatot folytatva ha nincs türelmünk újra és újra kiírni, hogy
  _"lisztet zsírban megpirítunk, hideg vízzel elkeverünk, és az ételhez adjuk"_, adhatunk ennek a néhány lépésnek egy
  együttes nevet (_"berántjuk"_). Csak egyszer kell leírnunk, hogy mit értünk _"rántás"_ alatt, és utána mindig elég
  csak ezt a nevet használnunk.

  Javascriptben a `function` szóval vezetünk be egy új függvényt:

  ~~~ javascript
  function duplaz(x) {
    return x * 2;
  }
  ~~~

  Ennek a függvénynek egy _paramétere_ is van (`x`). A paraméter egy változó, csak a kiindulási értékét az adja meg,
  aki meghívta a függvényt. A fenti függvénynek _visszatérési értéke_ is van.
  Vagyis ha azt írom, hogy `var y = duplaz(5)`, akkor meghívódik a függvény, `x` értéke 5 lesz a függvényen belül,
  kiszámítja és _visszaadja_ `x * 2` értékét, és ez az érték kerül az új `y` változóba.

  Javascriptben a függvényeket is lehet változókba tenni.
  Például `var f = duplaz`, és aztán `var z = f(3)` eredményeként `z` értéke 6 lesz.
  Ezt alaposan ki fogjuk használni.

  Gyakori helyzet, hogy meg akarjuk mondani, mi történjen egy esemény hatására. Például mi legyen, amikor ráklikkelnek
  egy gombra. Ilyenkor egy _név nélküli_ függvényt használhatunk:

  ~~~ javascript
  gomb.onclick = function() { alert('Megnyomtak!'); };
  gomb.addEventListener('click', function() { alert('Megnyomtak!'); });
  ~~~

  Mindkét sor működik. Az első sor példa arra, hogy függvényeket változókba is tehetünk. A második sor példa rá,
  hogy egy függvény lehet egy másik függvény paramétere. Az ilyen függvényt _callback_-nek is nevezzük.

- **Az objektumok** komplex értékek. Egy szám az egy szám, de egy weboldal már egy sokkal bonyolultabb objektum.
  De objektumokat is ugyanúgy betehetünk változókba, mint számokat. Például:

  ~~~ javascript
  var dani = {
    neve: 'Darabos Dániel',
    kora: 32,
    szulinap: function() { dani.kora = dani.kora + 1; },
  };
  ~~~

  Olyan, mint egy halom változó, amiket úgy tudunk elérni, hogy `objektum.változó`.

- **Egy elágazás** olyan kód, ahol a következő programrészlet vagy lefut, vagy nem.

  ~~~ javascript
  if (dani.kora > 100) {
    alert("Dani nagyon öreg.");
  }
  ~~~

- **Egy ciklus** olyan kód, ahol egy programrészlet többször fog lefutni.

  ~~~ javascript
  for (var i = 0; i < 10; i = i + 1) {
    alert("Még " + (10 - i) + "-szer kell OK-t nyomnod.");
  }
  ~~~

  A `for (X; Y; Z)` sorban az `X` egyszer fut le, az elején.
  Az `Y`-t minden menet előtt ellenőrizzük, és ha nem teljesül, vége a ciklusnak.
  A `Z`-t minden menet végén végrehajtjuk. Tehát a fenti ciklus 10 ablakot dob fel egymás után. (Elég bosszantóan.)

Ebből a pár alkatrészből áll a programok nagy része. Könnyen tudsz Javascripttel kísérletezni, ha megnyitod a Chrome
Javascript konzolját (**Tools** > **JavaScript Console**), vagy ennek megfelelőjét bármelyik böngészőben.
Próbáld meg a fenti példákat bemásolni ide és kísérletezni velük.

Ezt a konzolt érdemes a munka alatt nyitva tartani, mert ha elrontunk valamit, a hibaüzenetek is itt jelennek meg.
A saját programunkból ki tudunk írni valamit a konzolba a `console.log("üzenet")` paranccsal.
Ez általában kényelmesebb, mint az `alert` hatására felugró üzenet.

Visszatérve a gomb beprogramozására:

{% highlight javascript %}
var bevitel = document.getElementById('bevitel');
bevitel.onsubmit = function() {
  alert('hello');
  return false;  // Nem küldjük az adatokat sehova.
};
{% endhighlight %}

A `document` egy beépített változó, ami a weboldalt reprezentálja egy objektum formájában.
A `getElementById` ennek az objektumnak egy részváltozója, ami történetesen egy függvény. (Mint a `dani.szulinap` az én példámban.)
Ezt a függvényt meghívjuk a `'bevitel'` paraméterrel. Ez a függvény visszaad egy objektumot, ami a `<form>` elemet reprezentálja.
Ezt beletesszük egy új, `bevitel` nevű változóba.

(Hogy milyen beépített objektumok és függvények vannak, és mit csinálnak, azt a dokumentációban találjuk meg.
Itt az [MDN oldala a `document.getElementById`-ről](https://developer.mozilla.org/en-US/docs/Web/API/document.getElementById).)

A második sorban módosítjuk az űrlapot. Új értéket adunk az `onsubmit` tulajdonságának.
Az új érték egy függvény. (Aminek külön nevet sem adunk.) Ez a függvény feldob egy `hello` ablakot.

Ha megpróbálják az űrlapot elküldeni (a gomb megnyomásával, vagy az Enter billentyűvel), akkor ez az `onsubmit` függvény fog meghívódni.
Az űrlap rendes működése az, hogy amikor elküldik, átlép egy másik weboldalra. (Amit a `<form>` tag `action` attribútumával adunk meg.)
Ha ezt meg akarjuk akadályozni, az `onsubmit` függvény hamisat (`false`) kell visszaadjon.

## A táblázat bővítése

Ahhoz, hogy új sort tehessünk a táblázat tetejére, előbb tudnunk kell mit akarunk beletenni.

Egyrészt a beírt mérési eredményt:

{% highlight javascript %}
function meres() {
  var input = document.getElementById('meres');
  return input.value;
}
{% endhighlight %}

Másrészt a dátumot. Ha nincs kitöltve a dátum, akkor a mai dátumot.

{% highlight javascript %}
function datum() {
  var input = document.getElementById('datum');
  var ertek = input.value;
  if (ertek === '') {
    var ma = new Date();
    ertek = ma.toLocaleDateString('hu');
  }
  return ertek;
}
{% endhighlight %}

Ebben a `new Date()` új, de kitalálható, mit csinál: veszi a mai dátumot.
Utána ennek a magyarra (`'hu'`) lokalizált formáját kérjük.
Abban bíztam, hogy ez `june` helyett `június`-t fog adni, de csak magyar sorrendbe tette a számokat (`2014.6.21.`).
Egyelőre fogadjuk el ezt.

Az új sorban két új `<td>` elemre is szükségünk lesz. Úgyhogy csináljunk egy függvényt, ami ilyeneket hoz létre.

{% highlight javascript %}
function ujTD(szoveg) {
  var td = document.createElement('td');
  var tartalom = document.createTextNode(szoveg);
  td.appendChild(tartalom);
  return td;
}
{% endhighlight %}

Ezeket felhasználva már szépen meg tudjuk írni az igazi `onsubmit` függvényt:

{% highlight javascript %}
bevitel.onsubmit = function() {
  var naplo = document.getElementById('naplo');
  var ujTR = document.createElement('tr');
  ujTR.appendChild(ujTD(datum()));
  ujTR.appendChild(ujTD(meres()));
  naplo.insertBefore(ujTR, naplo.firstChild);
  return false;  // Nem küldjük az adatokat sehova.
}
{% endhighlight %}

Kész is vagyunk. Be lehet vinni új adatokat a táblázatba.

<iframe height="150" src="source/pelda-javascript.html">iframe</iframe>

Még nem tökéletes, például elfogad súlynak is és dátumnak is bármit.
De ezekkel egyelőre együtt tudunk élni.
A súlyosabb probléma az, hogy ha frissítjük az oldalt, elveszik minden adat, amit bevittünk!
A következő leckében megnézzük, [hogyan tudjuk egy szerveren eltárolni az adatokat](../4).
