# Higgsfield Reference Elements — Bexly (verbindliche IDs)

> Die realen, in Higgsfield gespeicherten Reference Elements. In Prompts als
> Platzhalter `<<<element_id>>>` einbetten — der Backend ersetzt sie durch
> `@name` und injiziert das Referenzbild. Mehrere Platzhalter pro Prompt möglich.
> Stand: 2026-07-25.

## Figuren (Chase / Szene 01)
| Figur | element_id | Hinweis |
|-------|-----------|---------|
| **Cal** | `4828ca5f-e224-4bf8-b192-ccaed5a3c468` | „tiny mouse with a big heart" |
| **Liv** | `a0538b9a-cb55-40e3-a7d5-e14e4cfcdb43` | graues Fell, **blaue Mähne** (beschriebene Version) |
| **Sammy** | `2c0f3d57-34f1-47d4-8f04-10bddfd6a785` | rundlich, **schwarze Stachelhaare** (beschriebene Version) |
| **Biff** | `e0c72df3-b688-49cd-b022-9eda7e2f90f4` | graue Bulldogge, Unterbiss, Sabber |

> ACHTUNG Duplikate: Es gibt je ein zweites, unbeschriftetes **Liv**
> (`aa529753-e590-48b1-8c10-e473c53e9404`) und **Sammy**
> (`d05e23b3-925f-40f7-a8a0-d6f20a3bff6c`). Vor Serienproduktion aufräumen /
> festlegen, welche kanonisch ist (sonst „leaken" Varianten).

## Weitere Figuren
| Figur | element_id |
|-------|-----------|
| Jet/Bexly (Roboterjunge) | `6e8de373-4e2d-4629-a7e0-cc2b654bda39` (detailliert) · alt: `ac429d21-…` |
| Cocosia | `b2b55814-d59b-40ad-9085-b6db07162341` (Cocosia-3) |
| General Nogath | `2f079c72-44fc-4f21-bfd7-603c556fd6c1` |
| Bauer Moe | `bc16119d-de18-4404-9025-74d88f42d98b` |
| Amy / Rob | `8ed83bed-…` / `1d57aee4-…` |
| Gretchen | `fd7ee4b1-95a4-46c1-b30c-d3f8cce9f7a2` |
| Chok (Nogaths Sohn) | `d18c6354-c6eb-4668-a41c-c415b56c26b0` |
| Gussok-Guard | `18dc132d-69f2-4a85-851b-ad3bb5241ad6` |

## Umgebungen / Master-Frames (Szene 01)
| Element | element_id / media | Zweck |
|---------|-------------------|-------|
| **WB-Forest-Path-Plate** | `548e9db0-9fcc-4fc1-8d93-5e9f9674317a` | Clean Plate Waldpfad (Maus-Augenhöhe, OHNE Figuren) |
| **Forest-Master-HQ** | element `ad24821e-…` · media `3955b0c6-7cde-46ec-b1ec-758a2ddc6c1f` | approbierter Verfolgungs-Master (alle Figuren) |
| **Forest-Master-Key** | `927543dd-…` | approbierte Key-Fassung |
| WB-Moes-Farm | `f59a43b3-39b1-41b9-8d61-294e896135ed` | Ziel der Verfolgung |

## Weitere Schlüssel-Locations (Canon)
| Element | element_id | Zweck |
|---------|-----------|-------|
| WB-Cellar-Mouse-View | `53027e73-0d2f-45b7-917b-d9cdf3ce47fa` | Keller, wo Cal Jet/Bexly trifft (Szene 13) |
| Gussok-Holo-Dome | `a1c7c5b2-8422-4372-a2a3-cf2b12ddca05` | rotes holografisches Half-Dome (Interface) |
| Gussok-Warship-Bridge | `8920bac1-4119-43bd-9498-689a14351a40` | Kommandobrücke |
| Bridge-Master-Key | `669d25c4-7a90-40ca-9bc9-bfa9dcfc70bc` | approbierte Brücke Szene 16 |
| WB-Gated-Community-Street | `a7636e96-8c3d-4408-b49f-11cc2812c36a` | Vorstadt (Bexly's erste Schritte) |
| Willowbrook-Aerial | `72c3bb1e-2a83-4215-9e3c-30dee6ca44a9` | Stadt-Geografie (verbindlich) |

## Test-Ergebnisse (Szene 01)
- **Shot 1 (Establishing)** Video-Job `e2d72321-d8d1-4465-8f44-715c57862581` —
  aus Forest-Master-HQ animiert. 35 Credits.
- **Locomotion-Tests** (Charakter-Element + Forest-Plate als image_references):
  - **Cal (ängstlich)** `0b0f2264-4fe6-40da-9c76-b04afa75acb7` — genre action
  - **Liv (energisch)** `0c5a4f7a-8b9a-4dfa-83da-c35441d25530` — genre action
  - **Sammy (Gewicht)** `330cfec2-9fbf-4725-bb42-1ab5db874d9d` — genre comedy
  Alle 10s/720p/fast, je 35 Credits. Distinkte Bewegungssignaturen bestätigt.

## Rezept (identitätstreue Einzel-Shots)
`seedance_2_0`, 720p, fast, 10s, 16:9, `generate_audio:false`,
`medias:[{role:image_references, value:<charakter-media-id>}, {role:image_references,
value:548e9db0-Forest-Plate-media d3830738-7ff2-4939-b550-26d13ef3d501}]`,
Prompt mit distinkter Locomotion + Kamera-Move + genre.
Charakter-Media-IDs: Cal `620065cb-75d1-46dc-9f55-b50220b26136`,
Liv `459f435b-5dca-41dd-b9a4-8297b7616ff1`,
Sammy `1db3bdb3-8d06-49bd-bf25-55df06591af4`.

## Demo-Reel (für Partner-Gespräche)
`BEXLY_Character_Pipeline_Demo.mp4` — 44s, 1280×720, 24fps. Aufbau:
Intro-Card (3s) → Szene 01 Verfolgung (10s) → Cal (10s) → Liv (10s) →
Sammy (10s) → Outro-Card (4s), je mit Lower-Third und 0.5s-Crossfades.
Quelle: die vier Test-Jobs (e2d72321 / 0b0f2264 / 0c5a4f7a / 330cfec2).
Zweck: Figurentreue + drei distinkte Bewegungssignaturen in einem Stück zeigen.
Schnitt via ffmpeg (Karten/Lower-Thirds mit PIL erzeugt).
