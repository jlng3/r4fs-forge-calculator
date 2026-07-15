# R4FS Forge Calculator

A comprehensive, browser-based forging and crafting planner for **Rune Factory 4 Special**. It models recipes, material effects, inheritance, upgrade order, level and rarity bonuses, elemental and status modifiers, and RF4's unusual special-material rules.

> **Unofficial fan project:** This project is not affiliated with, endorsed by, or sponsored by Marvelous Inc., XSEED Games, Nintendo, or any other Rune Factory rights holder. Rune Factory, Rune Factory 4 Special, and related names and intellectual property belong to their respective owners. No ownership of the Rune Factory franchise or its intellectual property is claimed.

## Live application

[Open the R4FS Forge Calculator](https://r4fs-forge-calculator.noyoudontknowmi.chatgpt.site)

## Features

- Manual forging and crafting calculator with live output.
- Complete weapon, staff, armor, shield, headgear, shoes, and accessory recipe selection.
- Required-category validation for recipe ingredients.
- Base-stat overriding and Barrett inheritance planning.
- Same-category accessory and shoe ability inheritance.
- Light Ore restrictions for cross-category weapon and staff inheritance.
- Ordered upgrade simulation with repeated-material decay.
- Double Steel, 10-Fold Steel, Object X, elemental crystals, colored Cores, clovers, scales, and other special rules.
- Level and rarity bonus calculations.
- STR, VIT, and INT conversion into effective ATK, DEF, M.ATK, and M.DEF.
- Build Optimizer for target thresholds or primary-stat maximization.
- Searchable and sortable Material Database with strict multi-effect filtering.
- Acquisition information covering monster drops, monster produce, mining, farming, fishing, field pickups, and failed recipes.
- In-place material replacement without rebuilding later upgrade slots.
- User-created materials stored locally in the browser.

## Project status

The calculator is a public fan-made reference tool. RF4 contains many interacting and partly hidden systems, so corrections supported by reproducible in-game testing or reliable sources are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a correction.

## Running locally

### Requirements

- Node.js 22.13 or newer
- npm

### Development

```bash
git clone https://github.com/jlng3/r4fs-forge-calculator.git
cd r4fs-forge-calculator
npm ci
npm run dev
```

Open the local URL printed by the development server.

### Validation

```bash
npm test
```

The calculator data is bundled with the application. Internet access is not required for calculations after the application has been built and loaded; external source links naturally require a connection.

## Repository layout

```text
app/
  page.tsx                  Calculator, inheritance, optimizer, and database UI
  material-data.ts         Material stats and upgrade effects
  material-source-data.ts  Acquisition methods and locations
  recipe-data.ts           Forging and crafting recipes
  equipment-data.ts        Equipment base stats and native elements
  globals.css               Application styling
tests/                      Rendered-output checks
scripts/                    Reproducible install, build, and validation helpers
worker/                     Production worker entry point
```

## Accuracy and methodology

Required recipe ingredients are treated as consumed inputs and do not grant their printed upgrade effects. Extra crafting materials, inherited candidates, base-stat donors, and ordered upgrades are evaluated separately. The output also applies the following core-stat conversions:

- 1 STR = 1 ATK
- 1 INT = 1 M.ATK
- 1 VIT = 0.5 DEF and 0.5 M.DEF

Optimizer results should be treated as planning assistance, then verified in-game with Barrett where inheritance randomness is involved.

## Data sources and attribution

The structured RF4 datasets were adapted from Rune Factory Wiki pages hosted by Fandom and subsequently reorganized, normalized, and corrected using in-game observations. Full attribution is provided in [ATTRIBUTION.md](ATTRIBUTION.md).

## Licensing

This repository uses separate licenses for code and data:

- Original application code is licensed under the [MIT License](LICENSE).
- Wiki-derived datasets and acquisition descriptions are licensed under [CC BY-SA 3.0](LICENSE-DATA.md).

These licenses apply only to material contributed to this repository under those terms. They do not grant rights to Rune Factory trademarks, game artwork, audio, characters, story content, or other intellectual property owned by Marvelous, XSEED Games, or other rights holders.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.
