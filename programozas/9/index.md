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

<iframe height="170" src="source/demo.html">iframe</iframe>

A HTML egyszerű:

{% highlight html %}
<div class="container">
  <div id="osszehasonlitas">Összehasonlítás <span class="lead">&raquo;</span></div>
  <div id="babalista">
    <label class="checkbox"><input type="checkbox">Öcsike</label>
    <label class="checkbox"><input type="checkbox">Nővérke</label>
    <label class="checkbox"><input type="checkbox">Hugica</label>
  </div>
  <p class="lead">Félix testsúlya napról napra.</p>
</div>
{% endhighlight %}


