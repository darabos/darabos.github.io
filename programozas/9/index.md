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
