---
id: UPL-LAW-017
number: 17
slug: termination-and-remedies-audit
title: Audit raskida i pravnih sredstava
category: Pravo i administracija
category_id: UPL-LAW
subcategory: Sastavljanje i pregled ugovora
subcategory_id: contract-drafting-review
language: sr
version: 1.0.0
status: stable
---

# AUDIT RASKIDA I PRAVNIH SREDSTAVA

Glavni cilj:

> Analizirajte prava na raskid i pravna sredstva kao kompletan lifecycle sistem tako da trigger-i, obaveštenja, cure, suspenzija, exit assistance, survival i posledice nakon raskida budu koherentni i izvršivi.

Ovaj prompt je prilagodljiv jurisdikciji i zasnovan na dokazima. Ne pretpostavljajte da je klauzula izvršiva, ništava, tržišni standard ili zakonski obavezna bez provere merodavnog prava i konteksta transakcije.

## 1. ULAZ ZA UGOVOR

Utvrdite:
- vrstu ugovora i komercijalni cilj
- strane, pravni status i pregovaračke uloge
- merodavno pravo, forum i mehanizam rešavanja sporova
- datum potpisivanja / stupanja na snagu i trajanje
- protivčinidbu, cenu i način plaćanja
- isporuke, milestone-e, acceptance i service level-e
- regulisane aktivnosti ili industrijska ograničenja
- eksterne politike, anekse, priloge i inkorporirane dokumente
- pregovaračku poziciju i nepromenljive poslovne zahteve

## 2. SPECIJALIZOVANI TOK RADA

- klasifikujte raskid zbog povrede, convenience-a, insolventnosti, produžene više sile i regulatornih događaja
- mapirajte notice i cure zahteve na svaki trigger
- razdvojite raskid, suspenziju, withholding, step-in i specifična pravna sredstva
- identifikujte naknade, refund, acceleration, transition assistance i obaveze vraćanja ili brisanja
- proverite survival poverljivosti, IP, plaćanja, indemnity i dispute klauzula
- testirajte da li raskid ostavlja blokirane podatke, imovinu, zavisnosti ili korisnike

## 3. MEHANIKA KLAUZULE

Za svaku materijalnu klauzulu utvrdite:
```text
Klauzula:
Svrha:
Trigger:
Akter:
Obaveza / pravo:
Standard:
Rok:
Zavisnost:
Izuzetak:
Diskrecija:
Dokaz izvršenja:
Posledica povrede:
Pravno sredstvo:
Survival:
Veza sa drugim klauzulama:
Osetljivost na merodavno pravo:
Operativni vlasnik:
```

## 4. MODEL RIZIKA

Odvojeno ocenite:
- rizik pravne izvršivosti
- komercijalnu izloženost
- finansijsku izloženost
- operativno opterećenje
- rizik nejasnog tumačenja
- compliance rizik
- verovatnoću spora
- težinu remedijacije

P0 - strukturni problem koji može ugroziti zakonitost, ovlašćenje, validnost ili osnovnu izvršivost  
P1 - materijalni rizik koji može promeniti odgovornost, ekonomiku, raskid ili vlasništvo  
P2 - značajan ali upravljiv rizik koji zahteva pregovore ili kontrole  
P3 - drafting slabost, nejasnoća ili zavisnost koju treba očistiti  
P4 - optimizacija, tržišno pozicioniranje ili unapređenje jasnoće

## 5. TEST KVALITETA NACRTA

Proverite:
- nedefinisane ili nedosledne termine
- kružne definicije
- sukobljene klauzule
- nemoguće ili neproverljive obaveze
- subjektivne standarde bez objektivnog oslonca
- prećutne pretpostavke
- nedostajuće triggere, rokove ili posledice
- neograničenu diskreciju
- obaveze bez pravnog sredstva
- pravna sredstva bez breach trigger-a
- nedosledan survival
- konflikt precedencije između tela ugovora, aneksa i politika
- formulacije koje ne odgovaraju stvarnom poslovnom cilju

## 6. GATE MERODAVNOG PRAVA

Za svako pitanje zavisno od jurisdikcije:
1. definišite pravnu tvrdnju
2. pronađite važeći primarni izvor ili autoritativne službene smernice
3. proverite datum, jurisdikciju i primenjivost
4. razdvojite prinudna pravila od dispozitivnih
5. razdvojite izvršivost od drafting preferencije
6. eksplicitno navedite neizvesnost

Nikada ne izmišljajte obavezne klauzule, tekst zakona, presude ili tržišne standarde.

## 7. SPECIJALIZOVANE MATRICE

- **Matrica trigger-a za raskid**: uključite referencu klauzule, problem, vlasnika rizika, pravni/komercijalni uticaj, dokaz, predloženu izmenu i fallback.
- **Tabela cure i notice zahteva**: uključite referencu klauzule, problem, vlasnika rizika, pravni/komercijalni uticaj, dokaz, predloženu izmenu i fallback.
- **Mapa obaveza nakon raskida**: uključite referencu klauzule, problem, vlasnika rizika, pravni/komercijalni uticaj, dokaz, predloženu izmenu i fallback.
- **Matrica konzistentnosti pravnih sredstava**: uključite referencu klauzule, problem, vlasnika rizika, pravni/komercijalni uticaj, dokaz, predloženu izmenu i fallback.

## 8. PREGOVARAČKI OUTPUT

Za svaki materijalni problem navedite:
```text
Problem:
Zašto je važan:
Efekat trenutnog teksta:
Željena pozicija:
Predloženi redline:
Fallback pozicija:
Walk-away prag:
Kontrausluga koja se može trgovati:
Verovatan prigovor druge strane:
Odgovor:
Preostali rizik ako se prihvati:
```

## 9. OBAVEZNI OUTPUT

Vratite:
1. Izvršni sažetak ugovornih rizika.
2. Pretpostavke i jurisdiction gate.
3. Mapu arhitekture ugovora.
4. Materijalne nalaze rangirane P0-P4.
5. Specijalizovane matrice.
6. Redline preporuke.
7. Pregovaračke prioritete i fallback pozicije.
8. Nedostajuće informacije, anekse i odobrenja.
9. Operativnu checklist-u za implementaciju.
10. Završnu proveru "da li ugovor kao sistem i dalje radi?".

Završite odeljkom **Provera integriteta ugovora** kojim potvrđujete da svaka materijalna obaveza ima jasnog aktera, trigger, standard, rok, zavisnost i posledicu, kao i da je svaka tvrdnja zavisna od jurisdikcije proverena ili eksplicitno označena kao nerešena.

Ovaj prompt pomaže pripremi za pregled i sastavljanje ugovora. Ne zamenjuje savet kvalifikovanog pravnika u relevantnoj jurisdikciji.
