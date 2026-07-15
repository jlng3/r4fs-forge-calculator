import assert from "node:assert/strict";
import test from "node:test";
import { MATERIAL_ROWS } from "../app/material-data.ts";
import {
  getMaterialSource,
  sortMonsterDropSource,
} from "../app/material-source-data.ts";

test("sorts Insect Carapace drops by first listed location and monster name",()=>{
  assert.equal(
    getMaterialSource("Insect Carapace"),
    "Monster drop — Beetle (Selphia Plain and Yokmir Forest), Ant (Yokmir Forest and Yokmir Cave), Hornet (Yokmir Cave), Killer Ant (Yokmir Cave), Scorpion (Delirium Lava Ruins), Heracles (Maya Road), Death Stalker (Sechs Territory), Ant Queen (Rune Prana Floor 4), Heaven's Scissors (Rune Prana Floor 5), or King Bee (Rune Prana Floor 2) · Monster produce — Ant",
  );
});

test("orders Floating Empire subareas after the general area",()=>{
  assert.equal(
    sortMonsterDropSource("Monster drop — South Bot (Floating Empire South), East Bot (Floating Empire East), General Bot (Floating Empire), or West Bot (Floating Empire West)"),
    "Monster drop — General Bot (Floating Empire), West Bot (Floating Empire West), East Bot (Floating Empire East), or South Bot (Floating Empire South)",
  );
});

test("orders Sharance Maze areas in their requested sequence",()=>{
  assert.equal(
    sortMonsterDropSource("Monster drop — Dragon (Sharance Maze: Dragon Ruins Lv. 2), Deepwater (Sharance Maze: Deepwater Shrine Lv. 2), General (Sharance Maze), Smoldering (Sharance Maze: Smoldering Prominence Lv. 2), or Garden (Sharance Maze: Garden of Light Lv. 2)"),
    "Monster drop — General (Sharance Maze), Garden (Sharance Maze: Garden of Light Lv. 2), Smoldering (Sharance Maze: Smoldering Prominence Lv. 2), Deepwater (Sharance Maze: Deepwater Shrine Lv. 2), or Dragon (Sharance Maze: Dragon Ruins Lv. 2)",
  );
});

test("keeps a monster's complete multi-location entry together",()=>{
  assert.equal(
    sortMonsterDropSource("Monster drop — Late Monster (Rune Prana Floor 7), or Early Monster (Yokmir Forest, Rune Prana Floor 7, and Sharance Maze: Dragon Ruins Lv. 2)"),
    "Monster drop — Early Monster (Yokmir Forest, Rune Prana Floor 7, and Sharance Maze: Dragon Ruins Lv. 2), or Late Monster (Rune Prana Floor 7)",
  );
});

test("sorts semicolon-separated drops while preserving general sources",()=>{
  assert.equal(
    sortMonsterDropSource("Monster drop — all beast-like bosses; Late Monster (Rune Prana Floor 7); or Early Monster (Selphia Plain)"),
    "Monster drop — all beast-like bosses; Early Monster (Selphia Plain); or Late Monster (Rune Prana Floor 7)",
  );
});

test("does not split the word or inside monster names",()=>{
  assert.equal(
    sortMonsterDropSource("Monster drop — Little Emperor (Leon Karnak) or Emperor Penguin (Sechs Territory)"),
    "Monster drop — Emperor Penguin (Sechs Territory) or Little Emperor (Leon Karnak)",
  );
});

test("keeps monsters that share one location together",()=>{
  assert.equal(
    sortMonsterDropSource("Monster drop — Hover Soldier or Hover Warrior (Floating Empire), or Tortas (Selphia Plain and Water Ruins)"),
    "Monster drop — Tortas (Selphia Plain and Water Ruins), or Hover Soldier or Hover Warrior (Floating Empire)",
  );
});

test("uses the complete requested location progression",()=>{
  assert.equal(
    sortMonsterDropSource("Monster drop — Field (Field Dungeon), Revival (Revival Cave), Autumn (Autumn Road), Den (Demon's Den), Hill (Sercerezo Hill), Nest (Cluck-Cluck Nest), or Mush (Mush Road)"),
    "Monster drop — Mush (Mush Road), Nest (Cluck-Cluck Nest), Hill (Sercerezo Hill), Den (Demon's Den), Autumn (Autumn Road), Revival (Revival Cave), or Field (Field Dungeon)",
  );
});

test("keeps corrected shared-location and production sources intact",()=>{
  assert.equal(
    getMaterialSource("Cheap Propeller"),
    "Monster drop — Hover Soldier (Floating Empire) or Hover Warrior (Floating Empire)",
  );
  assert.equal(getMaterialSource("Magic Powder"), "Monster drop — Little Mage (Idra Cave)");
  assert.equal(getMaterialSource("Material Stone"), "Field work — produced by striking a Rock with a hammer");
  assert.equal(
    getMaterialSource("Black Bird Feather"),
    "Monster drop — Blackbird (Maya Road, Rune Prana) · Monster produce — Blackbird",
  );
  assert.equal(
    getMaterialSource("Bull's Horn"),
    "Monster drop — Buffaloo (Delirium Lava Ruins) · Monster produce — Buffaloo",
  );
});

test("orders every location within a monster entry from earliest to latest",()=>{
  assert.equal(
    getMaterialSource("Palm Claw"),
    "Monster drop — Palm Cat (Delirium Lava Ruins and Autumn Road) or Leoplicant (Rune Prana Floors 4 and 7)",
  );
  assert.equal(
    getMaterialSource("Grimoire Scale"),
    "Monster drop — Grimoire (Leon Karnak, Field Dungeon, and Sharance Maze: Garden of Light Lv. 6)",
  );
  assert.equal(
    getMaterialSource("Ivory Tusk"),
    "Monster drop — Mammoo (Sechs Territory) or Elefun (Spring Area, Sercerezo Hill, and Idra Cave)",
  );
});

test("labels same-location monster drops independently",()=>{
  assert.equal(
    getMaterialSource("Pirate's Armor"),
    "Monster drop — High Ogre Viking (Rune Prana Floor 3) or High Orc Viking (Rune Prana Floor 3)",
  );
  assert.equal(
    getMaterialSource("Shoulder Piece"),
    "Monster drop — Ogre Viking (Sechs Territory) or Orc Viking (Sechs Territory)",
  );
});

test("expands the beast-like boss descriptions for Fur materials",()=>{
  assert.match(getMaterialSource("Fur")??"",/^Monster drop — all beast-like boss monsters including Greater Demon, Hinoe, Kinoto and Thunderbolt;/);
  assert.match(getMaterialSource("Quality Fur")??"",/^Monster drop — all beast-like boss monsters including Chimera, Crystal Mammoth, Greater Demon, Hinoe, Kinoto and Thunderbolt;/);
});

test("does not emit truncated or attached monster names for any recorded material",()=>{
  const names=[...new Set(MATERIAL_ROWS.map(row=>row.split("|")[0]))];
  for(const name of names){
    const source=getMaterialSource(name)??"";
    assert.doesNotMatch(source,/\)or\b|\b(?:Emper|Warri|Airr),|(?:—|,)\s*\(/,name);
  }
});
