---
layout: programozas
title: Web szerver
comments: false
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

{% highlight javascript %}
{
  "dependencies": {
    "express": "4.x"
  }
}
{% endhighlight %}

{% highlight javascript %}
var express = require('express')
var app = express();
app.get('/', function(req, res) {
  res.send('hello')
})
app.listen(8000)
{% endhighlight %}
