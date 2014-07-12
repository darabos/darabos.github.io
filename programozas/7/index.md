---
layout: programozas
title: Felhasználók
comments: true
---

# Felhasználók

Az előző leckében [sikerült a mérési adatokat egy adatbázisban tárolni](../6). Csak annyi a gond,
hogy mindenki minden adathoz hozzáfér. Most megoldjuk, hogy mindenki csak a saját babája adatait
tudja módosítani.

Régen minden weboldalon külön kellett regisztrálni, az ember mindenhol megadta ugyanazt a jelszót,
és ha a száz weboldal közül egynek betörtek a rendszerébe és megszerezték a jelszavunkat, akkor
a másik kilencvenkilencbe is be tudtak lépni a nevünkbne.

Ma kicsit jobb a helyzet, mert sok helyen Facebook, Twitter vagy Google felhasználónkkal tudunk
belépni. A felhasználónak könnyebb, gyorsabb, biztonságosabb, és nekünk sem kell saját felhasználói
azonosító rendszert fejlesztenünk. A Facebookos belépés a legelterjedtebb, úgyhogy én is ezt választom.

Hogy ezt be tudjuk üzemelni, meg kell ismernünk néhány technikát először.

## Redirect

A szerver a GET kérésre válaszul általában elküldi a kért tartalmat (HTML, CSS, kép, akármi).
De ehelyett adhat más választ is. Például a szerver túlterhelt, a kért tartalom nem létezik,
vagy létezik, de máshol van. Ez az utóbbi válasz a _redirect_, vagyis átirányítás egy másik
címre. Ilyenkor a böngésző átírja a címet a címsorban, és egy új GET requestet küld. Az új
cím mutathat akár egy másik szerverre is.

(A különböző válaszlehetőségeket [HTTP státusz kódoknak](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes) hívjuk.)

{% highlight javascript %}
app.get('/innen', function(req, res) {
  res.redirect('/ide');
});
{% endhighlight %}

Ezt arra fogjuk használni, hogy ha valaki nincs belépve, átirányítjuk a Facebook egy speciális
oldalára, ami azonosítja a felhasználót (be is lépteti, ha nincs Facebookra belépve), majd
visszaküldi hozzánk egy újabb átirányítással. Ezzel az átirányítással tudja a Facebook átadni
nekünk a felhasználó adatait.

## Cookie

Egy webszervernek nincs folyamatos kapcsolata a felhasználóval. Ha két felhasználó egyszerre böngészi
a weboldalunkat, a szerver csak független HTTP kérések sorozatát látja tőlük. Honnan tudhatja, hogy melyik
kérés melyik felhasználótól jött?

Ezt a problémát oldják meg a cookie-k.

A szerver a GET kérésre adott válaszában a tartalom előtt metaadatok (_header_) sorozatát
is elküldi. Ezek megmondják, milyen hosszú a tartalom (`Content-Length`), milyen típusú (`Content-Type`),
mikor frissült utoljára (`Last-Modified`), stb. Az egyik ilyen header a `Set-Cookie`.

A `Set-Cookie` header megkéri a böngészőt, hogy tároljon el egy kicsi adatot. Például jegyezze meg, hogy
`felhasználó = bejus79`. Amikor a böngésző később ugyanennek a szervernek küld egy kérést, visszaküldi
az összes cookie-t, amit a szerver beállított. (A kérésben szintén vannak headerek, és a `Cookie`
headerben küldi vissza a cookie-k tartalmát.)

Ezt a mechanizmust használhatjuk felhasználók azonosítására. Amikor valaki belép, beállítunk neki egy
cookie-t, és a későbbi kéréseinél tudni fogjuk, hogy kitől jött a kérés. Ez egyszerű, csak könnyen lehet
vele csalni. A cookie-t a böngésző tárolja a felhasználó számítógépén. Nem áll semmiből a felhasználónak
módosítania a cookie tartalmát (`felhasználó = rendszergazda`).

A `cookie-parser` modullal könnyen beállíthatunk és kiolvashatunk cookie-kat:

{% highlight javascript %}
cookieParser = require('cookie-parser');
app.use(cookieParser());
app.get('/belep/:felhasznalo', function(req, res) {
  res.cookie('felhasznalo', req.params.felhasznalo);
  res.redirect('/valami');
});
app.get('/valami', function(req, res) {
  console.log('felhasználó:', req.cookies.felhasznalo);
});
{% endhighlight %}

## Session

A cookie meghamisításának problémáját oldja meg a _session_. A felhasználó aktuális látogatásához
("session") kapcsolódó adatokat cookie helyett az adatbázisunkban tároljuk. Csak egy _session azonosítót_
tárolunk cookie-ban, és megoldjuk, hogy ezt ne igazán lehessen meghamisítani. A session cookie védelmére
az a megoldás, hogy egy nagyon nagyon nagy véletlen számot választunk azonosítónak. Ha valaki meg akarna
tippelni egy érvényes azonosítót, egymillió évig tippelgethetne, míg találna egy érvényeset.
