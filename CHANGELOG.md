# Changelog

All notable changes to the R4FS Forge Calculator are documented here. The project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions and will use semantic versions for public releases.

## [Unreleased]

### Added

- Separate visual rows for every acquisition method recorded for a material.
- Bold, method-specific color labels for monster drops, monster produce, mining,
  farming, fishing, field gathering, crafting, and other acquisition sources.

### Changed

- Ordered monster-drop entries by RF4 area progression, then alphabetically within
  the same area; multi-location monsters now list their own locations from earliest
  to latest without being split into duplicate entries.
- Labelled monsters that share a drop location independently and expanded the
  beast-like boss descriptions for Fur and Quality Fur.

### Corrected

- Fixed malformed or truncated acquisition descriptions affecting propellers,
  Magic, Magic Crystal, Small Crystal, Gold, Iron, feathers, furs, shards, and
  several shared-location monster drops.

### Planned

- Installable offline/PWA distribution.
- Optional desktop packaging after the web release stabilizes.

## [0.1.1] - 2026-07-15

### Added

- Automated static deployment to GitHub Pages at
  `https://jlng3.github.io/r4fs-forge-calculator/`.
- Static-export validation for the repository subpath and public asset URLs.
- A privacy section documenting local-only custom-material storage.

### Changed

- Replaced the ChatGPT Sites/Cloudflare Worker build with a static Next.js export.
- Updated all public application links to use GitHub Pages exclusively.
- Updated application metadata, title, description, and favicon paths for GitHub Pages.

### Removed

- ChatGPT authentication helpers and sign-in routes.
- ChatGPT Sites hosting metadata and build plugins.
- Cloudflare Worker, D1 database, R2 storage, Wrangler, Vinext, and example database scaffolding.
- Generated font-cache dependencies; the interface now uses its existing system-font stack.

### Privacy

- The public calculator requires no login and collects no user identity or calculator input.
- User-created materials remain only in that browser's local storage.

## [0.1.0] - 2026-07-15

First public source release. This version consolidates the project's 31 pre-release
development checkpoints into one clean public snapshot. The record below is intentionally
detailed so that the reasoning behind the calculator remains available even though those
working checkpoints are not part of the public Git history.

### Added

- Manual forging and crafting calculator with live effective-stat output.
- Complete RF4 forging and crafting recipe library.
- Equipment base stats, native elements, status effects, resistances, and accessory abilities.
- Material stat, status, elemental, resistance, rarity, difficulty, and acquisition datasets.
- Required-category recipe selection and user-defined local materials.
- Base-stat donor overriding and Barrett inheritance selection.
- Light Ore and same-category inheritance restrictions.
- Ordered upgrade simulation with repeat decay, Double Steel, 10-Fold Steel, and Object X state handling.
- Special handling for elemental crystals, colored Cores, clovers, scales, Scrap Metal+, range materials, and other conditional effects.
- Level and rarity bonuses and STR/VIT/INT effective-stat conversion.
- Build Optimizer for thresholds and primary-stat maximization.
- Strict multi-effect Material Database filters, sorting, and acquisition locations.
- In-place replacement for crafting, inheritance, and upgrade slots.

### Corrected

- Required recipe materials no longer grant upgrade effects during initial crafting.
- Donor equipment contributes level but not rarity or upgrade stats.
- Native donor elements and category-specific inheritance rules.
- Object X cancellation and isolation between donor and current-item upgrade sequences.
- Steel multiplier ordering in optimizer output.
- Material search duplicates and equipment/material name collisions, including Yarn.
- RF4 monster drops, monster produce, mining, farming, fishing, field, and failed-recipe sources across all material categories.

### Documentation

- Added dual MIT and CC BY-SA 3.0 licensing.
- Added source attribution, fan-project disclaimer, and contribution policy.

### Development record

#### Calculator foundation

- Built the initial manual R4FS forging calculator around material levels, upgrade
  difficulty, rarity, core stats, elemental damage, status attack rates, elemental
  resistance, and status resistance.
- Added separate crafting and upgrading stages with a live result panel so that each
  material selection can be inspected immediately.
- Added dropdown-driven equipment selection and automatic recipe filling for weapons,
  staffs, shields, headgear, armor, shoes, and accessories.
- Enforced recipe placeholders such as Minerals, Sticks and Stems, Claws and Fangs, and
  other material categories while retaining support for user-defined local materials.
- Defaulted all database materials and newly selected recipe materials to level 10.

#### Recipe, equipment, and material data

- Completed the RF4 forging and crafting recipe libraries from the RF4 wiki tables,
  including normalization of duplicate equipment names and spelling variants.
- Added native equipment ATK, M.ATK, DEF, M.DEF, STR, VIT, INT, elements, status attacks,
  elemental resistances, status resistances, and unique equipment effects.
- Completed the upgrade-relevant material library from Other Items and the four Raw
  Ingredients tables in Consumables; food recipes were deliberately excluded.
- Added a dedicated Material Database with strict multi-select effect filters, category
  filters, acquisition search, sortable numeric results, and an empty result when no
  material satisfies every selected condition.
- Split raw ingredients into Crops, Giant Crops, Flowers, Giant Flowers, and Fruits,
  including cross-listed fruit crops and seed/Giantizer guidance.
- Added and corrected acquisition data for monster drops, monster produce, mining,
  farming, fishing, field gathering, crafting failures, forging failures, and medicine
  failures. The corrections cover every material category and include late-game Rune
  Prana, Field Dungeon, Leon Karnak, Floating Empire, Sechs Territory, seasonal areas,
  and Sharance Maze locations.
- Distinguished ore nodes from gemstone nodes and preserved materials with multiple valid
  acquisition methods. Applied explicit special sources for Big Crystal, Invisible Stone,
  Light Ore, Golem Spirit Stone, Round Stone, Scrap Metal+, White Stone, Scrap Metal, and
  Object X.
- Removed the nonexistent Thin Stick entry; normalized Black Tortoise Shell to
  Blk. Tortoise Shell; corrected Blue Giant's Glove naming; and added Yarn without
  colliding with similarly named recipe or equipment records.

#### Crafting and inheritance rules

- Corrected required recipe materials so they are consumed by the recipe and do not grant
  their upgrade stats. Only materials placed in optional empty crafting slots and materials
  used during upgrading contribute their upgrade effects.
- Added base-stat overriding for weapons, staffs, headgear, armor, and shields, limited to
  one donor equipment item. The result retains the crafted item's name and appearance while
  using the donor's native base stats and native elemental typing.
- Added weapon-category validation: same-category weapon and staff donors need no Light
  Ore, while cross-category weapon or staff donors require Light Ore in the crafting phase.
  Light Ore in an upgrade slot, or on armor/accessories, produces a warning and no invalid
  inheritance benefit.
- Prohibited cross-category overriding for headgear, armor, and shields.
- Added same-category special-effect inheritance for shoes and accessories. These items
  retain their own base stats and may inherit up to three selected donor effects, for a
  maximum of four effects when the crafted item has its own native effect.
- Made Barrett-style inheritance selection explicit so a user can choose which randomly
  available donor materials or equipment effects were actually inherited in game.
- Ensured donor equipment level contributes to the Total Level Bonus while donor rarity is
  treated as zero. Donors do not directly contribute their upgrade stats, status rates, or
  resistances beyond the selected inherited contents and valid base-stat override.
- Isolated each donor equipment's internal upgrade sequence from the crafted item's current
  upgrade sequence, including independent Object X reversal state.

#### Stat totals and bonuses

- Added Total Level Bonus and Total Rarity Bonus calculations with their applicable caps
  and thresholds.
- Included STR, INT, and VIT in displayed effective combat stats: 1 STR contributes 1 ATK,
  1 INT contributes 1 M.ATK, and 1 VIT contributes 0.5 DEF plus 0.5 M.DEF.
- Updated result explanations so effective ATK, M.ATK, DEF, and M.DEF visibly account for
  base stats, material effects, inheritance, level/rarity bonuses, and core-stat conversion.

#### Ordered upgrade simulation

- Added sequential upgrade calculation, duplicate-material decay, elemental weapon typing,
  and conditional warnings rather than treating upgrades as an unordered stat sum.
- Implemented Double Steel and 10-Fold Steel as multipliers of the immediately preceding
  eligible material, and prevented the optimizer from placing either Steel first or using
  invalid Steel-on-Steel chains.
- Implemented Object X as a persistent polarity toggle: every Object X reverses subsequent
  ordinary upgrade effects, and a later Object X cancels that reversal. This supports
  sequences such as Object X -> Mealy Apple -> Object X -> normal material.
- Corrected Object X behavior separately for donor equipment so a donor sequence such as
  Object X -> Mealy Apple -> Mealy Apple is evaluated in isolation and inherited correctly.
- Added upgrade-only handling for Scrap Metal+ (weapons deal exactly 1 damage), Raccoon
  Leaf and Glitta Augite weapon range, clover drop-rate effects, colored Core sequencing,
  shield Scale inheritance for dual blades/fists, and N/A upgrade difficulty as zero.
- Corrected 4-Leaf Clover and Great 4-Leaf Clover to approximately 11% drop-rate effects,
  with required recipe clovers exempt from upgrade-slot warnings and Great 4-Leaf Clover's
  effect restricted to valid weapon use.
- Added live-output validation so weapon-only, shield-only, required-sequence, and other
  conditional special effects appear only when their conditions are satisfied.

#### Equipment abilities

- Added the unique effects for RF4 rings, pendants, necklaces, scarves, boots, sandals,
  shoes, brooches, belts, proofs, and Arts equipment.
- Included combat, companion, farming-tool, recovery, experience, skill experience,
  movement, dungeon encounter, ailment reversal, charge speed, RP-cost, dash, terrain,
  audio, appearance, and item-drop effects in the live result display and inheritance pool.

#### Search and editing usability

- Corrected crafting search so it matches actual material/equipment names instead of
  unrelated recipe ingredient text.
- Removed duplicated search results and the unconditional Scrap Metal+ result that appeared
  in upgrade searches.
- Added persistent crafting, inheritance, and upgrade slots. Any occupied slot can now be
  replaced directly without deleting every subsequent material, while the ordered result is
  recalculated immediately.

#### Build Optimizer

- Added a separate Build Optimizer mode while keeping the established Manual Calculator
  workflow intact.
- Added target constraints for core stats, elemental damage, status attack rates,
  elemental resistance, and status resistance, with an achievable build returning optional
  crafting materials, ordered upgrades, donor equipment, inherited contents, and warnings.
- Added optional base-stat donor use for weapons, staffs, headgear, armor, and shields, with
  correct crafting-slot costs for the donor and Light Ore when required.
- Added optional accessory/shoe effect inheritance with up to three donor effects and
  same-category restrictions.
- Added maximization objectives for one or two effective combat stats so users can ask for
  maximum ATK, M.ATK, DEF, or M.DEF without guessing a numeric target. Objectives include
  indirect STR, INT, and VIT contributions rather than optimizing raw displayed stats in
  isolation.
- Corrected optimizer sequencing for Double Steel, 10-Fold Steel, Mealy Apple, and Object X,
  including inserting a second Object X when later materials must return to normal polarity.
- Improved mixed-goal and donor searches after a Rune Shield comparison exposed optimizer
  builds that met resistance thresholds but left substantial DEF/M.DEF value unused.
- Kept optimizer output auditable by listing the donor, carried materials/effects, complete
  upgrade order, level and rarity totals, core-stat gains, final effective stats, resistances,
  and any unmet or invalid condition.
