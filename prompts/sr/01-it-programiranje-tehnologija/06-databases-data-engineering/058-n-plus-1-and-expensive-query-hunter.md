---
id: UPL-IT-058
number: 58
slug: n-plus-1-and-expensive-query-hunter
title: Lov na N+1 i skupe upite
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.1.0
status: stable
---

# LOV NA N+1 I SKUPE UPITE

Želim sistematski pronaći sve N+1, duplicate, overfetch i hidden expensive query obrasce u aplikaciji.

Glavni cilj:

> Povezati application call path sa stvarnim brojem DB round-trip-ova i dokazati gde workload raste kao O(n) ili gore umesto približno konstantno/batched.

## 1. OBJECTIVE AND NON-GOALS

Za svaku putanju liste, detalja, izvoza, GraphQL-a i background posla dokaži kako broj i trošak odlazaka do baze rastu sa količinom obrađenih podataka i ispravi putanje gde rastu linearno (ili gore) umesto da ostanu konstantni ili batch-ovani.

Van obima:

- označavanje svakog toka sa više od jednog query-ja kao N+1
- smanjivanje broja query-ja po svaku cenu (jedan ogroman join može biti gori od tri batch-ovana query-ja)
- opšte podešavanje pojedinačnih sporih SQL query-ja (samo kada su deo ponavljanog obrasca)
- uvođenje cache-a da bi se sakrio problem pristupa podacima

## 2. CONTEXT DISCOVERY

Prvo utvrdi:

```text
ORM / query builder and version:
Default loading behavior (lazy, eager, explicit):
API style (REST, GraphQL, RPC, server-rendered templates):
Batching / loader library and where its instances are created:
How queries can be observed (ORM query log, DB statement statistics, APM spans, test query counter):
Connection pool size per instance and number of instances:
Typical network latency between application and database:
Page sizes and maximum page sizes allowed by the API:
```

## 3. EVIDENCE MODEL

```text
A - measured: query counts and timings captured for the path at several input sizes (log, APM trace, test counter)
B - complete path: call chain from the entry point to repeated data access is fully traced in code, including loops, serializers and resolvers
C - strong static evidence: data access inside a loop or lazy relation access, but the call chain or input size is not confirmed
D - inference: plausible repetition depending on configuration or data shape
E - hardening: preventive measure (query-count assertion, loader adoption) where the path is currently fine
```

## 4. FINDING STATUS

- **CONFIRMED** - izmeren ili potpuno praćen linearni rast broja query-ja ili troška sa veličinom ulaza (tier A ili B).
- **LIKELY** - jak statički dokaz (tier C).
- **NOT VERIFIED** - zavisi od oblika podataka, konfiguracije ili ponašanja ORM-a koji nisu mogli da se provere.
- **NOT APPLICABLE** - veličina ulaza je po dizajnu ograničena i mala (na primer fiksna lista od 5 podešavanja).
- **CONTROLLED** - ponavljanje postoji, ali je batch-ovano, keširano po zahtevu ili na drugi način ograničeno.
- **HARDENING** - preventivno poboljšanje bez trenutnog problema (P4).

## 5. FALSE-POSITIVE RULES

Sledeće samo po sebi **nije** nalaz:

- Više query-ja nije automatski N+1. Zahtev koji uvek izvršava 5 query-ja bez obzira na veličinu strane je konstantan, a ne N+1.
- Lazy loading nije defekt dok stvarna putanja koda ne pristupa relaciji više puta za mnogo parent zapisa.
- Petlja nad malom, ograničenom kolekcijom (na primer 3 načina plaćanja jednog korisnika) nije problem skaliranja.
- Veći broj query-ja posle ispravke nije regresija ako su ukupno vreme u bazi, broj skeniranih redova i latencija opali (split query-ji umesto Cartesian join-a).
- Nemoj izmišljati apsolutne granice broja query-ja ("više od 20 query-ja je loše"); ocenjuj po tome kako broj i trošak rastu sa ulazom i po izmerenoj latenciji i opterećenju.

## 6. REQUEST-TO-QUERY TRACING

Za svaku kandidat putanju mapiraj lanac od ulazne tačke do SQL-a:

```text
HTTP/API operation or job:
↓
controller / resolver / handler:
↓
service method:
↓
repository / ORM call (and the line where the relation is touched):
↓
SQL fingerprint(s) and how many times each runs:
```

Skriveno ponavljanje obično živi u poslednja dva koraka: serializer-i, template helper-i, computed property-ji, authorization hook-ovi i GraphQL field resolver-i.

## 7. REQUEST-LEVEL QUERY COUNT

Za critical endpoints meri:

```text
1 item
10 items
100 items
```

## 8. SCALING SIGNATURE

Izmeri svaku važnu putanju pri rastućoj veličini ulaza, gde je to bezbedno:

```text
items:            1     10     100     1000
queries:          ?     ?      ?       ?
DB time (ms):     ?     ?      ?       ?
rows scanned:     ?     ?      ?       ?
latency p50/p95:  ?     ?      ?       ?
```

Očekivano ponašanje je konstantno ili stepenasto (jedan dodatni batch po relaciji). Linearni rast broja query-ja ili vremena u bazi je potpis N+1; rast brži od linearnog (ugnježdene relacije) je još gori. Koristi oblik podataka sličan production-u: tenant sa 10 projekata ponaša se drugačije od onog sa 10.000.

## 9. N+1 SIGNATURE

```text
1 parent query
+
N child queries
```

## 10. NESTED N+1

```text
users
↓
projects per user
↓
tasks per project
```

Can become O(users × projects).

## 11. GRAPHQL

Resolver N+1.

## 12. DATALOADER

Check key scope/cache.

## 13. LOADER AND CACHE SCOPE

Batching loader-i rešavaju N+1 samo kada se ispravno koriste:

- pravi instance loader-a **po zahtevu** (ili po operaciji); cache loader-a na nivou procesa može da prikaže podatke jednog korisnika drugom korisniku i da zauvek zadrži zastarele podatke
- obezbedi da se autorizacija primenjuje na ono što loader vraća, a ne samo na query najvišeg nivoa
- batch funkcija mora da vrati rezultate redosledom traženih ključeva i eksplicitno da obradi ključeve koji nedostaju
- loader-i koji se koriste iz background poslova moraju da imaju sopstveni opseg i invalidaciju posle upisa
- proveri da svaka resolver putanja zaista ide kroz loader; jedan direktan ORM poziv u field resolver-u ponovo uvodi N+1

## 14. SERIALIZER

Lazy relation access during serialization.

## 15. TEMPLATE

Rendering triggers lazy queries.

## 16. ADMIN UI

Often overlooked.

## 17. EXPORT

Thousands of rows magnify N+1.

## 18. BACKGROUND JOB

No user latency, but DB load still real.

## 19. LOOP

Search for DB calls inside loops.

## 20. ASYNC LOOP

`Promise.all` may turn sequential N+1 into concurrent DB storm.

## 21. PARALLEL N+1

Can be worse for pool exhaustion.

## 22. LAZY LOADING

Hidden query.

## 23. EAGER LOADING

Can solve N+1 but cause Cartesian explosion.

## 24. JOIN EXPLOSION

Multiple one-to-many includes.

## 25. EAGER LOADING ROW EXPLOSION

Rešavanje N+1 eager loading-om više one-to-many relacija u jednom join-u umnožava redove:

```text
50 orders, each with 20 items and 10 comments (two sibling relations)
joined in one query: 50 × 20 × 10 = 10,000 rows
to return 50 + 1,000 + 500 = 1,550 logical records
```

Za svaku eager-load ispravku uporedi broj prenetih redova i potrošenu memoriju sa alternativom od jednog batch-ovanog query-ja po relaciji (split query / preload). Izaberi oblik sa najmanjim ukupnim troškom, a ne sa najmanjim brojem query-ja.

## 26. SPLIT QUERY

Can be better.

## 27. PRELOAD/BATCH

## 28. `IN (...)`

Large list limit/performance.

## 29. CHUNKING

## 30. DUPLICATE QUERY

Same PK loaded multiple times in one request.

## 31. REQUEST CACHE

Identity map/unit of work may already solve.

## 32. OVERFETCH COLUMNS

Huge blob/text not used.

## 33. OVERFETCH RELATIONS

## 34. COUNT PER ROW

Classic.

## 35. EXISTS PER ROW

Can batch.

## 36. PERMISSION QUERY PER ROW

May be both performance and auth complexity.

## 37. AUTHORIZATION N+1

Provere dozvola po redu su čest skriveni N+1:

- policy provere koje za svaki red posebno učitavaju resurs, njegovog vlasnika i članstvo
- list endpoint-i koji dohvate sve, pa filtriraju po dozvolama u kodu aplikacije (to je i rizik od izlaganja podataka ako filter nije potpun)
- field-level autorizacija u GraphQL-u koja izvršava query za svako polje svake stavke

Ispravi tako što ćeš predikat dozvole prebaciti u query ili batch-om proceniti dozvole za sve ID-eve odjednom. Nikada ne rešavaj problem performansi uklanjanjem ili slabljenjem provere autorizacije.

## 38. TENANT CONFIG PER ROW

Cache/request scope.

## 39. USER LOOKUP PER ROW

## 40. PROVIDER CALL

Extend analysis beyond DB if loop calls external API.

## 41. ORM QUERY LOG

Capture exact SQL.

## 42. TRACE

Map to source call site.

## 43. LATENCY

DB local low latency can hide N+1 until production network.

## 44. CONNECTION POOL

Parallel N+1 can consume all.

## 45. CONNECTION POOL IMPACT

Ponavljanje se pretvara u ispad kroz pool:

```text
request issues 200 queries through Promise.all
↓
pool size 20 per instance
↓
each request holds many connections at once
↓
10 concurrent requests exhaust the pool
↓
unrelated fast endpoints wait for connections and time out
```

`Promise.all` ili paralelni stream-ovi nisu rešenje za N+1: menjaju latenciju za bujicu konekcija. Izmeri vreme čekanja na pool i broj aktivnih konekcija pri realnoj konkurentnosti, a ne samo latenciju pojedinačnog zahteva.

## 46. ROW COUNT

Measure returned/scanned.

## 47. CARTESIAN PRODUCT

One mega join can be worse than several batched queries.

## 48. BALANCE

Goal is lowest total cost, not minimum query count at all costs.

## 49. PAGINATION

N+1 multiplies page size.

## 50. API `include`

Optional relation expansion.

## 51. GRAPHQL COMPLEXITY

User can request nested expensive fields.

## 52. CACHE

Do not hide DB abuse with long global cache if data correctness suffers.

## 53. TOTAL DATABASE COST

Rangiraj nalaze po ukupnom trošku, a ne po najdramatičnijem broju query-ja:

```text
total cost = calls per second × queries per call × average DB time per query
```

List endpoint koji se poziva 300 puta u sekundi sa 21 query-jem po pozivu može više da optereti bazu od noćnog izvoza sa 10.000 query-ja. Uključi background poslove i izvoze, koji se ne vide u latenciji za korisnike, ali i dalje troše kapacitet baze.

## 54. ENDPOINT QUERY SCALING MATRIX

| Endpoint / job | Calls/sec | Queries at 1 / 10 / 100 items | Growth | DB time per call | Pool wait | Pattern | Status |
|---|---:|---|---|---:|---:|---|---|

## 55. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Scope (endpoint / resolver / job):
Trigger (request shape, page size, include/expand parameters):
Call chain (entry point -> ORM call -> SQL fingerprint):
Pattern (N+1, nested N+1, parallel N+1, duplicate query, overfetch, count per row, authorization per row, external call per row):
Scaling signature (queries and DB time at 1 / 10 / 100 items):
Rows scanned / returned:
Latency and pool impact:
Impact:
Blast radius (endpoints, tenants, concurrency):
Evidence:
Root cause:
Fix options (with trade-offs):
Benchmark before:
Benchmark after:
Verification (query-count assertion or trace):
Regression risk:
```

## 56. SEVERITY

- **P0** - ponavljani pristup podacima koji može da iscrpi bazu ili njen connection pool za ceo sistem i koji bilo koji korisnik ili klijent može da izazove (na primer neograničena veličina strane ili dubina GraphQL-a).
- **P1** - dokazan linearni ili gori rast na kritičnoj putanji sa mnogo saobraćaja koji izaziva timeout-e, iscrpljivanje pool-a ili značajno opterećenje baze; cache loader-a koji prenosi podatke između korisnika.
- **P2** - značajna latencija ili trošak baze na važnim endpoint-ima, izvozima ili poslovima.
- **P3** - ponavljanje na putanjama sa malo saobraćaja ili sa malim ograničenim ulazima.
- **P4** - hardening: testovi broja query-ja, uvođenje loader-a, vidljivost.

## 57. OUTPUT

`N_PLUS_1_EXPENSIVE_QUERY_HUNTER.md`

## 58. SECOND PASS

Za svaku operaciju liste, pretrage, detalja, izvoza i GraphQL-a proceni:

- broj query-ja i vreme u bazi za 1, 10 i 100 stavki (1.000 gde je bezbedno)
- svako opciono proširenje relacija (`include`, `expand`, GraphQL polja)
- serijalizaciju odgovora i renderovanje template-a
- provere autorizacije po redu
- brojanje agregata i provere postojanja po redu
- eksterne API pozive po redu
- maksimalnu veličinu strane i dubinu GraphQL-a koju klijent može da zatraži
- background poslove i izvoze nad najvećim tenant-om

Zatim pokušaj da opovrgneš svaki nalaz: da li je kolekcija zapravo ograničena? Da li cache po zahtevu ili identity map već uklanja ponavljanje? Da li bi predloženi eager load izazvao eksploziju redova?

## 59. FINAL QUALITY GATE

Nemoj označiti sve tokove sa više query-ja kao N+1. N+1 defekt postoji kada broj query-ja ili trošak baze rastu sa brojem obrađenih stavki.

Pre vraćanja izveštaja proveri da:

- svaki nalaz ima praćen lanac poziva od ulazne tačke do SQL fingerprint-a
- svaki potvrđeni nalaz ima scaling signature za više veličina ulaza, a ne jedan broj query-ja
- apsolutna granica broja query-ja nije korišćena kao jedini argument
- su provereni ugnježdeni, paralelni, serializer, template, authorization i resolver putevi
- su instance loader-a vezane za zahtev i ne zaobilaze autorizaciju
- su predloženi eager load-ovi provereni na eksploziju redova i da su razmotreni split query-ji
- su uticaj na pool pri konkurentnosti i ukupan trošak baze uzeti u obzir za rangiranje
- su eksterni API pozivi po redu prijavljeni odvojeno od nalaza o bazi
- su statusi i evidence tier-ovi dosledno primenjeni

# KONAČNO PRAVILO

Tražim:

```text
GET /projects

1 query -> 100 projects

serializer loops:
project.owner.name

lazy relation
↓
100 additional user queries

then:
project.taskCount
↓
100 COUNT queries

total:
201 queries
```

Drugi failure chain-ovi koje tražim:

```text
GraphQL query: projects(first: 100) { owner { name } tasks { assignee { name } } }
↓
each field resolver loads its relation directly through the ORM
↓
1 + 100 owners + 100 task lists + (100 × 30) assignees
↓
3,201 queries for one request
↓
a client can make it worse by requesting first: 1000
```

```text
N+1 "fixed" by including orders.items and orders.comments in one join
↓
50 × 20 × 10 = 10,000 joined rows for 1,550 records
↓
response time improves locally, memory spikes in production
↓
large tenants hit out-of-memory errors
```

```text
user loader created once at application startup
↓
cache is shared by all requests and never cleared
↓
user B receives user A's cached profile data after a permission change
↓
performance fix becomes a data-exposure bug
```
