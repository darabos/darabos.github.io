---
layout: programozas
title: Adatbázis
comments: true
---

# Adatbázis

Az előző leckében [írtunk egy webszervert](../3). Az weboldalon bevitt adatok már eljutnak a szerverhez,
csak a tárolásuk kérdéses.

Itt is sok választási lehetőségünk van. Én a klasszikus SQL adatbázis használatát mutatom be.

Konkrétan egy PostgreSQL adatbázist fogunk használni. Ezt is telepíthetnénk a laptopra, és folytathatnánk
úgy a fejlesztést. De ugyanannyi (vagy kevesebb) erőfeszítéssel beüzemelhetünk egy olyan adatbázist, ami
nem a laptopon, hanem egy távoli adatközpontban fut. Erre úgyis szükség lesz, úgyhogy csak előnye van.

## Heroku

Sok cég azzal foglalkozik, hogy számítógépeket ad bérbe az Interneten keresztül. Nagy a verseny közöttük
és annyira lenyomják az árakat, hogy mindegyik cégnél kaphatunk valamit ingyen.
A [Heroku](https://www.heroku.com/)-nál ez 1 számítógép és egy 10 000 soros adatbázis.
Ez most tökéletesen megfelel, tehát irány a regisztráció!


