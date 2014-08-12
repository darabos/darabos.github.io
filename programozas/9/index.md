---
layout: programozas
title: Babák összehasonlítása
comments: true
---

# Babák összehasonlítása

Az előző leckében [egy grafikonnal egészítettük ki az oldalt](../8).
A használt grafikonrajzoló csomag könnyen ki tud rajzolni több idősort is egy diagramra.
Nem lesz nehéz megoldani, hogy két baba idősorát egyszerre láthassuk.

Mivel elég érzékeny adatokról van szó, korlátozzuk az összehasonlítást egy felhasználó
két babájára.

Egy felhasználó összes babájának az összes adata is csak pár kilobyte lehet. Legegyszerűbb,
ha mindet elküldjük egy baba oldalának megtekintésekor, és a kliensoldali Javascriptben
választjuk ki, hogy melyikeket jelenítjük meg az ábrán.

## Kinyíló panel

Az összehasonlítás egy ritkán használt funkció, ezért jó megoldás elrejteni a részletes
vezérlőfelületet.

<iframe height="180" src="source/demo.html">iframe</iframe>

A HTML egyszerű:

{% highlight html %}
<style>
#osszehasonlitas {
  background-color: hsl(90, 25%, 95%);
  border-radius: 5px;
  margin-top: 5px;
  display: inline-block;
  padding: 0 5px;
}
#nyito {
  cursor: default;
}
</style>
<div class="container">
  <div id="osszehasonlitas">
    <div id="nyito">Összehasonlítás <span class="lead">&raquo;</span></div>
    <div id="babalista">
      <label class="checkbox"><input type="checkbox">Öcsike</label>
      <label class="checkbox"><input type="checkbox">Nővérke</label>
      <label class="checkbox"><input type="checkbox">Hugica</label>
    </div>
  </div>
  <p class="lead">Félix testsúlya napról napra.</p>
</div>
{% endhighlight %}

A CSS-ben a `hsl` függvény a szín megadásának egyik módja. Az első szám (`90`) fokban van,
és zöldet jelent a színkörön. A második szám a szín intenzitása (`25%`, vagyis fakó), a
harmadik pedig a világossága (`95%`, vagyis majdnem fehér).

A `display: inline-block` beállítás arra szolgál, hogy az elem blokkjellegű legyen, de
csak annyira legyen széles, amennyire szükséges. A `cursor: default` a függőleges vonal
helyett a nyilat állítja be egérkurzornak, ezzel hangsúlyozva, hogy ez egy klikkelhető elem.

A nyitáshoz és csukáshoz szükséges CSS és/vagy Javascript meglepően bonyolult.
Mivel ez egy nagyon gyakori igény, sok Javascript csomag nyújt egyszerűen használható megoldást,
köztük a legnépszerűbb Javascript csomag, a [**jQuery**](http://jquery.com/) is.
Ezt a csomagot egyébként is érdemes ismerni.

{% highlight html %}
<script src="/jquery.min.js"></script>
<script>
$(function() {
  $('#babalista').hide();
  $('#osszehasonlitas #nyito').click(function() {
    $('#babalista').toggle(200);
  });
});
</script>
{% endhighlight %}

A `$` nevű változón keresztül érhetőek el a jQuery által kínált funkciók.
A saját scriptünk első sora megad egy `onload` függvényt. Írhatnánk úgy is, hogy `window.onload = function() { ... };`.
De a jQuery itt is megspórol pár karaktert.

Egy HTML elemet jQueryt használva a CSS szabályoknak megfelelő szintaxissal érhetünk el.
Például `$('span')` lenne az összes `<span>` elem. `$('.container p.lead')` lenne a `container` osztályú elemeken
belüli `lead` osztályú `<p>` elemek listája. Mint CSS-ben, itt is `#` karakterrel nevezhetjük meg az `id`
attribútum alapján az elemeket.

A `click` függvény egy `onclick` függvényt állít be. jQuery nélkül azt írtuk volna,
`document.getElementById('nyito').onclick = function() { ... };`.

A `hide` függvény elrejti a kiválasztott elemeket, mintha ott sem volnának. A `show` függvény
ennek a fordítottja és megjeleníti az elrejtett elemeket. A `toggle` a kettő között vált.
Mind a három függvénynek megadható, hogy milyen gyorsan (hány ezredmásodperc alatt) végezzék el a változtatást.
Ha nem adunk meg sebességet, azonnali a változtatás.

## Két idősor

Most a szülőhöz tartozó összes baba adatait el akarjuk küldeni a böngészőnek. Lehetne, hogy a meglévő `babak` függvénnyel
lekérjük a babák listáját és utána a meglévő `baba` függvénnyel egyesével elkérjük mindegyik baba adatait.
De egyszerűbb és hatékonyabb, ha az adatbázistól egyszerre kérjük el a megfelelő méréseket.
Csak annyi a baj ezzel, hogy az `adatok` táblában nincs benne a baba szülőjének azonosítója.
A megoldást az SQL _join_ képessége nyújtja, amivel két táblát összeköthetünk. Az új lekérdezés parancsa:

    SELECT azonosito, adatok.datum, adatok.suly
      FROM babak JOIN adatok USING (azonosito) WHERE babak.szulo = '1234567';

Ez a mindkét táblában létező `azonosito` oszlop alapján összekapcsolja a `babak` és az `adatok` táblákat.
Kiválasztja azokat a sorokat, ahol a `babak` táblázat `szulo` oszlopa `1234567`. (Mondjuk hogy ez egy szülő azonosítója.)
És ezekből a sorokból kiválasztja az `azonosito`, `datum` és `suly` oszlopokat. (Az utóbbiak az `adatok` táblából jönnek.)

Ennek lekérdezésnek az eredményét beletesszük a `baba.hjs`-be. Az `app.js` valahogy így változik:

{% highlight javascript %}
function adatok(szulo, utana) {
  adatbazis(
    'SELECT azonosito, adatok.datum, adatok.suly' +
    ' FROM babak JOIN adatok USING (azonosito) WHERE babak.szulo = $1',
    [szulo],
    utana
  );
}

app.get('/baba/:azonosito', belepve, function(req, res) {
  babak(req.user.id, function(babak) {
    var baba = babak.filter(function(baba) {
      return baba.azonosito == req.params.azonosito;
    })[0];
    if (baba === undefined) {  // A keresett baba nincs a felhasználó babái között.
      res.redirect('/');
    }
    adatok(req.user.id, function(adatok) {
      res.render('baba.hjs', {
        azonosito: baba.azonosito,
        neve: baba.nev,
        babak: babak,
        adatok: adatok,
      });
    });
  });
});
{% endhighlight %}

A `filter` függvény kiválasztja egy tömbnek azokat az elemeit, amik megfelelnek egy megadott függvénynek.
Ezzel ellenőrizzük, hogy a keresett baba a felhasználó babái közé tartozik-e.

A több baba adatait a kliensoldali Javascriptben fogjuk rendszerezni.
Az adatbázis lekérdezés eredményeként mindenféle rend nélkül, vegyesen kapjuk meg a különböző babákhoz tartozó
mérési adatokat. Ezeket szét kell válogassuk.

{% highlight javascript %}{% raw %}
var azonosito = '{{azonosito}}';

var adatok = [
  {{#adatok}}
    { azonosito: '{{azonosito}}', datum: {{datum}}, suly: {{suly}}, esemeny: '{{esemeny}}' },
  {{/adatok}}
  ];

var babak = {
  {{#babak}}
    '{{azonosito}}': { nev: '{{nev}}', adatok: [] },
  {{/babak}}
  };

for (var i = 0; i < adatok.length; ++i) {
  var adat = adatok[i];
  babak[adat.azonosito].adatok.push(adat);
}
{% endraw %}{% endhighlight %}

A fenti ciklusban átcsoportosítottuk baba szerint az adatokat.

Az egyik baba kitüntetett, az ő oldalát nyitotta meg a felhasználó. Ennek a babának az azonosítója van
az `azonosito` változóban. A táblázatban az ő adatait akarjuk megjeleníteni:

{% highlight javascript %}
function betablaz() {
  var adatok = babak[azonosito].adatok;
  // ...
}
{% endhighlight %}

És az új mérési eredményeket is ehhez a babához kell eltároljuk:

{% highlight javascript %}
$('#bevitel').submit(function() {
  var adatok = babak[azonosito].adatok;
  // ...
});
{% endhighlight %}

A többi babát pedig az összehasonlításos dobozban kell felsorolnunk. A jQuery sokkal könnyebbé teszi az
új elemek létrehozását:

{% highlight javascript %}
$(function() {
  $('#babalista').hide();
  $('#osszehasonlitas #nyito').click(function() {
    $('#babalista').toggle(200);
  });
  for (var b in babak) {
    if (b != azonosito) {
      var baba = babak[b];
      $('#babalista').append(
        '<label class="checkbox"><input class="baba" id="' + baba.azonosito +
        '" type="checkbox">' + baba.nev + '</label>');
    }
  }
  betablaz();
  kirajzol();
});
{% endhighlight %}

A CSV adatok előkészítése is változik. Egy időponthoz lehet egy vagy több babának is adata.
A CSV tartalmazhat üres adatokat, például ha három babából csak a másodiknak
van mérése egy nap, a hozzá tartozó sor lehet `2014-05-04,,3000,`.

Először kiolvassuk az összehasonlításos dobozból, hogy kik vannak kiválasztva. (Az elsődleges
babát mindig kiválasztjuk.)

{% highlight javascript %}
function kirajzol() {
  var rajzol = [babak[azonosito]];
  var tesok = $('#babalista input[type="checkbox"]');
  for (var i = 0; i < tesok.length; ++i) {
    var teso = tesok[i];
    if (teso.checked) {
      rajzol.push(babak[teso.id]);
    }
  }
{% endhighlight %}

Utána megcsináljuk a CSV első sorát, amibe a babák nevei kerülnek. Ezzel egyszerre összegyűjtjük
az összes adatpont dátumát (az `idok` objektumban), és a babák adatait dátum szerint tesszük elérhetővé
(az `adatok` listában).

{% highlight javascript %}
  var csv = 'Dátum';
  var idok = {};
  var adatok = [];
  for (var i = 0; i < rajzol.length; ++i) {
    var b = rajzol[i];
    csv += ',' + b.nev;
    adatok[i] = {};
    for (var j = 0; j < b.adatok.length; ++j) {
      var adat = b.adatok[j];
      adatok[i][formaz(adat.datum)] = adat.suly;
      idok[formaz(adat.datum)] = true;
    }
  }
  csv += '\n';
{% endhighlight %}

Most már csak végig kell mennünk az összes dátumon, és minden babához sorban kiírni az időponthoz
tartozó mérést vagy egy üres stringet (`''`).

{% highlight javascript %}
  idok = Object.keys(idok);
  idok.sort();
  for (var i = 0; i < idok.length; ++i) {
    var ido = idok[i];
    csv += ido;
    for (var j = 0; j < adatok.length; ++j) {
      var adat = adatok[j];
      csv += ',' + (adat[ido] || '');
    }
    csv += '\n';
  }
  var d = new Dygraph(
    document.getElementById('grafikon'), csv,
    { fillGraph: true, includeZero: true, connectSeparatedPoints: true });
}
{% endhighlight %}

A `connectSeparatedPoints` beállítás azt kéri, hogy a vonal folytonos legyen akkor is, ha hiányzó
eredmények vannak.

<iframe height="220" src="source/demo-ket-idosor.html">iframe</iframe>

Valahogy így néz ki az eredmény. Rendben megjelenik a két idősor, de hacsak nem ikrekről van szó,
nehéz összehasonlítani a két gyermek fejlődését. Jobb lenne, ha az X tengelyen dátum helyett az életkor
jelenne meg, amikor összehasonlítást végzünk.

## Események

Feltételezhetnénk, hogy az első mérés a születési súly. De lehetnek születés előtti becsült értékek
is a listában, vagy lehet más csavar. Szebb megoldás, ha a mérésekhez eseményeket is eltárolunk.
Ezzel személyesebbé is válnak az adatok, mert tárolhatjuk azt is, hol kezdett el járni, beszélni a baba.
Ezeket az eseményeket a diagramokon is feltüntethetjük.

Első lépés az adatbázis táblához egy új sort hozzáadni.

    ALTER TABLE adatok ADD esemeny TEXT
    UPDATE adatok SET esemeny = ''

Az `ALTER TABLE` paranccsal lehet különböző változtatásokat elvégezni egy táblán. Az `ADD` parancs egy új
oszlopot ad hozzá, most épp `esemeny` névvel és `TEXT` típussal.

Az `UPDATE` parancs meglévő sorokat változtat meg. Most az összes soron üresre állítjuk az `esemeny` oszlopot.
(Az `UPDATE` parancs használható egy sor megváltoztatására is, ha a végére olyat írunk, hogy
`WHERE azonosito = '1234'`.)

Az `adatok` táblát érintő meglévő kódot mindenhol ki kell egészíteni az új oszlop kezelésével.
Ezt nem részletezem.

A `/mentes` végponthoz hasonlóan csinálunk egy `/esemeny` végpontot. Ez nem új sort hoz létre az
`adatok` táblában, hanem egy meglévő sort módosít. De ugyanúgy ellenőriznünk kell előbb, hogy az érintett
baba a felhasználóhoz tartozik-e. Ezt a funkcionalitást is érdemes kiemelni egy middleware függvénybe.

{% highlight javascript %}
function sajatBaba(req, res, next) {
  var azonosito = req.body.azonosito;
  var szulo = req.user.id;
  adatbazis('SELECT szulo FROM babak WHERE azonosito = $1', [azonosito], function(babak) {
    if (babak[0].szulo !== szulo) {
      res.status(403);
      res.send('A baba nem a felhasználóhoz tartozik.');
    } else {
      next();
    }
  });
}

app.post('/mentes', belepve, sajatBaba, function(req, res) {
  var uj = req.body;
  adatbazis(
    'INSERT INTO adatok (azonosito, datum, suly) VALUES ($1, $2, $3)',
    [uj.azonosito, uj.datum, uj.suly],
    function() { res.send('ok'); }
  );
});

app.post('/esemeny', belepve, sajatBaba, function(req, res) {
  var adat = req.body;
  adatbazis(
    'UPDATE adatok SET esemeny = $1 WHERE azonosito = $2 AND datum = $3',
    [adat.esemeny, adat.azonosito, adat.datum],
    function() { res.send('ok'); }
  );
});
{% endhighlight %}

A kliensoldalon a HTML táblázatban csináljunk egy harmadik oszlopot az eseményeknek.

{% highlight javascript %}
function betablaz() {
  var adatok = babak[azonosito].adatok;
  adatok.sort(function(a, b) { return a.datum - b.datum; });
  var naplo = $('#naplo');
  naplo.empty();
  for (var i = adatok.length - 1; i >= 0; --i) {
    var adat = adatok[i];
    naplo.append(
      '<tr><td>' + formaz(adat.datum) + '</td>' +
      '<td class="lead">' + adat.suly + ' g</td>' +
      '<td><input data-datum="' + adat.datum + '" class="form-control" value="' +
      adat.esemeny + '"></td></tr>');
  }
{% endhighlight %}

Az `empty` függvényt a jQuery biztosítja. Ez egy sokkal kényelmesebb módja egy elem tartalmának a törlésére.

A `data-valami` nevű attribútumokkal tetszőleges stringeket tárolhatunk el egy elemben.
Amikor később az elemmel kapcsolatos Javascript kód fut, az attribútum tartalmát az `elem.dataset.valami`
szintaxissal érhetjük el. Így oldjuk meg, hogy az esemény mentésekor tudjuk, hogy melyik időponthoz
akarjuk elmenteni.

Lehetne minden sorban egy _mentés_ gomb az `<input>` mező mellett, de túl bonyolultnak tűnne az oldal.
Egyszerűbb, ha minden változást elmentünk.

{% highlight javascript %}
  naplo.find('input').change(function(event) {
    var adat = { azonosito: azonosito, datum: parseInt(event.target.dataset.datum), esemeny: event.target.value };
    $.ajax({
      url: '/esemeny',
      data: JSON.stringify(adat),
      type: 'POST',
      contentType: 'application/json',
    });
  });
}
{% endhighlight %}

A `naplo.find` függvényt is a jQuery adja. Megkeresi az elemen belüli, feltételnek megfelelő elemeket.
Ezek pontosan az eseménybeviteli mezők. A `change` függvény egy eseménykezelőt állít be, ami a mező
változásakor fut le. Ezt a függvényt fogja meghívni, ha a felhasználó módosítja a mező tartalmát, és
utána entert nyom vagy átlép egy másik mezőbe.

A `$.ajax` is egy jQuery függvény, amivel kényelmesebben küldhetünk `XMLHttpRequest`eket.

Ez működik, de nem a legbarátságosabb. A `change` esemény nem igazán intuitív, mert ha a felhasználónak
nem jut eszébe entert nyomni, akkor csak úgy mentjük el a változtatást, ha kiválaszt egy _másik_
elemet a weboldalon. Nem jelzi semmi, hogy elmentettük a változtatást.
Az események formátuma sem egyértelmű. Lehet-e vesszővel elválasztani több eseményt?

Szerintem jó megoldás a [Bootstrap Tokenfield](http://sliptree.github.io/bootstrap-tokenfield/).
Könnyű beüzemelni, és így néz ki:

<iframe height="60" src="source/demo-tokenfield.html">iframe</iframe>

A CSS és Javascript fájlok betöltése után csak egy új sorra van szükség.

{% highlight html %}
<link rel="stylesheet" href="/bootstrap-tokenfield.min.css"></link>
<script src="/bootstrap-tokenfield.min.js"></script>
<script>
// ...
function betablaz() {
  // ...
  naplo.find('input').tokenfield();
  naplo.find('input').change(function(event) {
{% endhighlight %}

