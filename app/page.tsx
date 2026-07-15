"use client";

import { useMemo, useState } from "react";
import { RECIPE_ROWS } from "./recipe-data";
import { MATERIAL_ROWS } from "./material-data";
import { EQUIPMENT_ROWS } from "./equipment-data";
import { DATABASE_INGREDIENT_CATEGORIES, getMaterialDatabaseCategories, getMaterialSource } from "./material-source-data";

type ItemType = "weapon" | "staff" | "armor";
type Element = "none" | "fire" | "water" | "earth" | "wind" | "light" | "dark" | "love" | "earth & wind" | "fire & water" | "light & dark" | "fire, water, earth & wind" | "fire, water, earth, wind, light & dark";
type EffectKey =
  | "atk" | "matk" | "def" | "mdef" | "str" | "vit" | "int"
  | "crit" | "diz" | "stun" | "knock" | "range"
  | "poisonAtk" | "sealAtk" | "paralysisAtk" | "sleepAtk" | "fatigueAtk" | "sickAtk" | "faintAtk" | "drainAtk"
  | "fireRes" | "waterRes" | "earthRes" | "windRes" | "lightRes" | "darkRes" | "loveRes" | "noRes"
  | "poisonRes" | "sealRes" | "paralysisRes" | "sleepRes" | "fatigueRes" | "sickRes" | "faintRes" | "drainRes" | "critRes" | "dizRes" | "knockRes";

type Effects = Partial<Record<EffectKey, number>>;
type Special = "normal" | "double" | "tenfold" | "objectx";
type MaterialCategory = "Minerals" | "Jewels" | "Crystals" | "Sticks and Stems" | "Liquids" | "Feathers" | "Shells and Bones" | "Stones" | "Strings" | "Shards" | "Furs" | "Powders and Spores" | "Cloths and Skins" | "Claws and Fangs" | "Scales" | "Misc." | "Grasses" | "Raw Ingredients" | "Equipment";
type EquipmentIngredient = { group: RecipeGroup; base: Effects; element?: Element; ability?: string };
type Material = { id: string; name: string; level: number; rarity: number; difficulty?: number; effects: Effects; category?: MaterialCategory; special?: Special; element?: Element; core?: "red" | "blue" | "yellow" | "green"; note?: string; equipment?: EquipmentIngredient };
type Slot = { uid: string; material: Material; contributes: boolean; requiredCategory?: MaterialCategory; requiredLabel?: string; overrideSelected?: boolean };
type RecipeGroup = "Short Sword" | "Long Sword" | "Spear" | "Axe" | "Hammer" | "Dual Blades" | "Gloves" | "Staff" | "Tool" | "Armor" | "Shield" | "Headgear" | "Shoes" | "Accessory";
type Requirement = { exact?: string; category?: MaterialCategory };
type Recipe = { id: string; name: string; group: RecipeGroup; level: number; type: ItemType; base: Effects; element?: Element; requirements: Requirement[] };

const CATEGORIES: MaterialCategory[] = ["Minerals","Jewels","Crystals","Sticks and Stems","Liquids","Feathers","Shells and Bones","Stones","Strings","Shards","Furs","Powders and Spores","Cloths and Skins","Claws and Fangs","Scales","Misc.","Grasses","Raw Ingredients","Equipment"];

const ELEMENTS: { key: Exclude<Element, "none">; label: string; icon: string }[] = [
  { key: "fire", label: "Fire", icon: "♨" }, { key: "water", label: "Water", icon: "●" },
  { key: "earth", label: "Earth", icon: "◆" }, { key: "wind", label: "Wind", icon: "≈" },
  { key: "light", label: "Light", icon: "✦" }, { key: "dark", label: "Dark", icon: "☾" },
  { key: "love", label: "Love", icon: "♥" },
  { key: "earth & wind", label: "Earth & Wind", icon: "◆" },
  { key: "fire & water", label: "Fire & Water", icon: "♨" },
  { key: "light & dark", label: "Light & Dark", icon: "✦" },
  { key: "fire, water, earth & wind", label: "Four elements", icon: "◇" },
  { key: "fire, water, earth, wind, light & dark", label: "Six elements", icon: "✦" },
];

const PRESETS: Material[] = [
  { id: "fire-crystal", name: "Fire Crystal", level: 1, rarity: 7, effects: { atk: 5 }, element: "fire", note: "ATK +5; imbues a non-elemental weapon" },
  { id: "water-crystal", name: "Water Crystal", level: 1, rarity: 7, effects: { matk: 5 }, element: "water", note: "M.ATK +5; imbues a non-elemental weapon" },
  { id: "earth-crystal", name: "Earth Crystal", level: 1, rarity: 8, effects: { def: 5 }, element: "earth", note: "DEF +5; imbues a non-elemental weapon" },
  { id: "wind-crystal", name: "Wind Crystal", level: 1, rarity: 8, effects: { mdef: 5 }, element: "wind", note: "M.DEF +5; imbues a non-elemental weapon" },
  { id: "light-crystal", name: "Light Crystal", level: 1, rarity: 10, effects: { str: 3, int: 3 }, element: "light", note: "STR +3, INT +3" },
  { id: "dark-crystal", name: "Dark Crystal", level: 1, rarity: 3, effects: { str: 3, vit: 3 }, element: "dark", note: "STR +3, VIT +3" },
  { id: "love-crystal", name: "Love Crystal", level: 1, rarity: 10, effects: { drainAtk: 3 }, element: "love", note: "Drain ATK +3%" },
  { id: "big-red", name: "Big Red Crystal", level: 1, rarity: 15, effects: { fireRes: 20 }, note: "Fire RES +20%" },
  { id: "big-blue", name: "Big Blue Crystal", level: 1, rarity: 15, effects: { waterRes: 20 }, note: "Water RES +20%" },
  { id: "big-green", name: "Big Green Crystal", level: 1, rarity: 15, effects: { windRes: 20 }, note: "Wind RES +20%" },
  { id: "big-white", name: "Big White Crystal", level: 1, rarity: 15, effects: { earthRes: 20 }, note: "Earth RES +20%" },
  { id: "double-steel", name: "Double Steel", level: 1, rarity: 5, effects: {}, special: "double", note: "Adds 2× the prior material's full printed effect; once per item" },
  { id: "tenfold-steel", name: "10-Fold Steel", level: 1, rarity: 10, effects: {}, special: "tenfold", note: "Adds 8× the prior material's full printed effect; once per item" },
  { id: "object-x", name: "Object X", level: 1, rarity: 5, effects: {}, special: "objectx", note: "Reverses all subsequent standard upgrade effects" },
  { id: "mealy-apple", name: "Mealy Apple", level: 1, rarity: 15, effects: { str: -100, int: -100, vit: -150, fireRes: -10.01, waterRes: -10.01, earthRes: -10.01, windRes: -10.01, lightRes: -10.01, darkRes: -10.01 }, note: "Use after Object X to reverse its penalties" },
  { id: "red-core", name: "Red Core", level: 1, rarity: 13, effects: { mdef: 77 }, core: "red", note: "One of four cores for +10% non-elemental RES on armor" },
  { id: "blue-core", name: "Blue Core", level: 1, rarity: 13, effects: { mdef: 77 }, core: "blue", note: "One of four cores for +10% non-elemental RES on armor" },
  { id: "yellow-core", name: "Yellow Core", level: 1, rarity: 13, effects: { mdef: 77 }, core: "yellow", note: "One of four cores for +10% non-elemental RES on armor" },
  { id: "green-core", name: "Green Core", level: 1, rarity: 13, effects: { mdef: 77 }, core: "green", note: "One of four cores for +10% non-elemental RES on armor" },
  { id: "firewyrm", name: "Firewyrm Scale", level: 1, rarity: 15, effects: { str: 300, int: -10 }, note: "STR +300, INT -10" },
  { id: "electro", name: "Electro Crystal", level: 1, rarity: 15, effects: { atk: 60, matk: 150, mdef: -5, paralysisAtk: 35 }, note: "ATK +60, M.ATK +150, PAR ATK +35%" },
  { id: "left-rock", name: "Left Rock Shard", level: 1, rarity: 12, effects: { poisonRes: 6, sealRes: 6, paralysisRes: 6, sleepRes: 6, fatigueRes: 6, sickRes: 6, faintRes: 1, drainRes: 1 }, note: "Broad status resistance" },
];

const BASIC_MATERIALS: Material[] = [
  ...["Iron","Bronze","Silver","Gold","Platinum","Orichalcum","Dragonic Stone"].map((name, i) => ({ id:`mat-${name.toLowerCase().replaceAll(" ","-")}`, name, level:1, rarity:[1,2,4,6,9,13,15][i], effects:{}, category:"Minerals" as MaterialCategory, note:"Recipe material; edit its level and printed effects if needed" })),
  ...["Amethyst","Aquamarine","Emerald","Ruby","Sapphire","Diamond"].map((name, i) => ({ id:`mat-${name.toLowerCase()}`, name, level:1, rarity:[2,3,4,5,6,9][i], effects:{}, category:"Jewels" as MaterialCategory, note:"Jewel recipe material" })),
  ...["Magic Crystal","Small Crystal","Big Crystal","Rune Crystal"].map((name, i) => ({ id:`mat-${name.toLowerCase().replaceAll(" ","-")}`, name, level:1, rarity:[5,10,12,14][i], effects:{}, category:"Crystals" as MaterialCategory, note:"Crystal recipe material" })),
  ...["Plant Stem","Bull's Horn","Rigid Horn","Thick Stick","Devil Horn","Moving Branch"].map(name => ({ id:`mat-${name.toLowerCase().replace(/[^a-z]+/g,"-")}`, name, level:1, rarity:0, effects:{}, category:"Sticks and Stems" as MaterialCategory, note:"Eligible for Sticks and Stems recipe slots" })),
  ...["Glue","Devil Blood","Paralysis Poison","Poison King"].map(name => ({ id:`mat-${name.toLowerCase().replaceAll(" ","-")}`, name, level:1, rarity:0, effects:{}, category:"Liquids" as MaterialCategory, note:"Eligible for Liquids recipe slots" })),
  ...["Bird's Feather","Yellow Feather","Black Bird Feather","Thunderbird Feather","Dragon Fin"].map(name => ({ id:`mat-${name.toLowerCase().replace(/[^a-z]+/g,"-")}`, name, level:1, rarity:0, effects:{}, category:"Feathers" as MaterialCategory, note:"Eligible for Feathers recipe slots" })),
  ...["Turtle Shell","Fish Fossil","Skull","Dragon Bones","Black Tortoise Shell","Ammonite"].map(name => ({ id:`mat-${name.toLowerCase().replaceAll(" ","-")}`, name, level:1, rarity:0, effects:{}, category:"Shells and Bones" as MaterialCategory, note:"Eligible for Shells and Bones recipe slots" })),
  ...["Round Stone","Tiny Golem Stone","Golem Stone","Golem Spirit Stone","Tablet of Truth"].map(name => ({ id:`mat-${name.toLowerCase().replaceAll(" ","-")}`, name, level:1, rarity:0, effects:{}, category:"Stones" as MaterialCategory, note:"Eligible for Stones recipe slots" })),
  ...["Yarn","Old Bandage","Spider's Thread","Vine","Strong Vine","Pretty Thread","Puppetry Strings"].map(name => ({ id:`mat-${name.toLowerCase().replace(/[^a-z]+/g,"-")}`, name, level:1, rarity:0, effects:{}, category:"Strings" as MaterialCategory, note:"Eligible for Strings recipe slots" })),
  ...["Broken Hilt","Broken Box","Left Rock Shard","Right Rock Shard"].map(name => ({ id:`mat-${name.toLowerCase().replaceAll(" ","-")}`, name, level:1, rarity:0, effects:{}, category:"Shards" as MaterialCategory, note:"Eligible for Shards recipe slots" })),
  ...["Fur","Wooly Furball","Red Lion Fur","Blue Lion Fur"].map(name => ({ id:`mat-${name.toLowerCase().replaceAll(" ","-")}`, name, level:1, rarity:0, effects:{}, category:"Furs" as MaterialCategory, note:"Eligible for Furs recipe slots" })),
  ...["Poison Powder","Holy Spore","Fairy Dust","Magic Powder","Mysterious Powder"].map(name => ({ id:`mat-${name.toLowerCase().replaceAll(" ","-")}`, name, level:1, rarity:0, effects:{}, category:"Powders and Spores" as MaterialCategory, note:"Eligible for Powders and Spores recipe slots" })),
  ...["Cheap Cloth","Quality Cloth","Quality Worn Cloth","Silk Cloth","Ghost Hood","Insect Carapace","Pretty Carapace","Ancient Orc Cloth"].map(name => ({ id:`mat-${name.toLowerCase().replaceAll(" ","-")}`, name, level:1, rarity:0, effects:{}, category:"Cloths and Skins" as MaterialCategory, note:"Eligible for Cloths and Skins recipe slots" })),
  ...["Insect Jaw","Wolf Fang","Panther Claw","Magic Claw","Gold Wolf Fang","Giant's Nail","Dangerous Scissors","Ivory Tusk"].map(name => ({ id:`mat-${name.toLowerCase().replace(/[^a-z]+/g,"-")}`, name, level:1, rarity:0, effects:{}, category:"Claws and Fangs" as MaterialCategory, note:"Eligible for Claws and Fangs recipe slots" })),
  ...["Wet Scale","Grimoire Scale","Crimson Scale","Blue Scale","Glitter Scale","Black Scale","Love Scale"].map(name => ({ id:`mat-${name.toLowerCase().replaceAll(" ","-")}`, name, level:1, rarity:0, effects:{}, category:"Scales" as MaterialCategory, note:"Eligible for Scales recipe slots" })),
];

const presetCategory = (m: Material): MaterialCategory => {
  if (m.name.includes("Crystal") || m.core) return "Crystals";
  if (m.name.includes("Steel")) return "Minerals";
  if (m.name.includes("Scale")) return "Scales";
  if (m.name.includes("Rock Shard")) return "Shards";
  return "Misc.";
};
const slugify = (value: string) => value.toLowerCase().replace(/\+/g,"-plus").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const SOURCE_MATERIALS: Material[] = MATERIAL_ROWS.map(row => {
  const [name, category, difficulty, rarity, effectText, note] = row.split("|");
  const effects: Effects = {};
  effectText.split(",").filter(Boolean).forEach(part => {
    const [key, value] = part.split(":");
    effects[key as EffectKey] = Number(value);
  });
  return { id:`mat-${slugify(name)}`, name, category:category as MaterialCategory, difficulty:Number(difficulty), rarity:Number(rarity), level:10, effects, note:note || undefined };
});
const BUILTIN_MATERIALS: Material[] = [
  ...SOURCE_MATERIALS.map(source => {
    const preset = PRESETS.find(p => p.name === source.name);
    return preset ? {
      ...source,
      id:preset.id,
      special:preset.special,
      element:preset.element,
      core:preset.core,
      note:[source.note,preset.note].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(" · ") || undefined,
    } : source;
  }),
  ...PRESETS.filter(p => !SOURCE_MATERIALS.some(m => m.name === p.name)).map(m => ({...m, category:presetCategory(m)})),
  ...BASIC_MATERIALS,
].map(m => ({...m,level:10})).filter((m, i, all) => all.findIndex(x => x.name === m.name) === i);

const ARMOR_GROUPS = new Set<RecipeGroup>(["Armor","Shield","Headgear","Shoes","Accessory"]);
const EQUIPMENT_DATA = new Map(EQUIPMENT_ROWS.map(row => {
  const [group,name,effectText,element] = row.split("|");
  const base: Effects = {};
  effectText.split(",").filter(Boolean).forEach(part => {
    const [key,value] = part.split(":");
    base[key as EffectKey] = Number(value);
  });
  return [`${group}|${name}`,{base,element:(element || undefined) as Element | undefined}] as const;
}));
const RECIPES: Recipe[] = RECIPE_ROWS.map(row => {
  const [groupRaw,name,levelRaw,materialsRaw] = row.split("|");
  const group = groupRaw as RecipeGroup;
  const key = `${group}|${name}`;
  const equipment = EQUIPMENT_DATA.get(key);
  const requirements: Requirement[] = materialsRaw.split(";").map(material => CATEGORIES.includes(material as MaterialCategory) ? {category:material as MaterialCategory} : {exact:material});
  return {id:`${slugify(group)}-${slugify(name)}`,name,group,level:Number(levelRaw),type:group === "Staff" ? "staff" : ARMOR_GROUPS.has(group) ? "armor" : "weapon",base:equipment?.base || {},element:equipment?.element,requirements};
});
const EQUIPMENT_ABILITIES: Record<string,string> = {
  "Shield Ring":"Reduces received damage to exactly 1 on 25% of hits.",
  "Throwing Ring":"Increases the range of thrown items.",
  "Dolphin Brooch":"Boosts the battle stats of the player's family members.",
  "Happy Ring":"Increases item-finding chance by approximately 11%.",
  "Star Pendant":"Multiplies EXP gained by 1.5×.",
  "Sun Pendant":"Doubles a human companion's stats and halves damage they receive in battle.",
  "Field Pendant":"Doubles a monster companion's stats and halves damage they receive in battle.",
  "Dew Pendant":"Doubles ATK, DEF, M.ATK, M.DEF, STR, VIT, and INT on the equipped farm tool.",
  "Earth Pendant":"Doubles HP and RP restored by recovery items and food; temporary stat increases are unaffected.",
  "Heart Pendant":"Multiplies Skill EXP gained by 1.5×.",
  "Strange Pendant":"Treats both the player's and enemies' DEF and M.DEF as 0.",
  "Anette's Necklace":"Increases the player's movement speed.",
  "Rosary":"Prevents non-boss monsters from appearing in dungeons.",
  "Talisman":"Reverses Poison into HP regeneration, Paralysis into a speed boost, Fatigue into reduced RP consumption, and Cold into RP regeneration.",
  "Magic Charm":"Damage uses whichever is higher: ATK or M.ATK.",
  "Magic Ring":"Reduces charging time for weapons, staffs, and farm tools.",
  "Champ Belt":"Multiplies maximum HP by 1.5× and adds VIT +120.",
  "Hero's Proof":"Regenerates 1.5% HP every two seconds.",
  "Proof of Wisdom":"Regenerates 0.75% RP every two seconds.",
  "Art of Attack":"Greatly increases melee attack range and produces sonic waves when swinging.",
  "Art of Defense":"Halves flinch duration after taking a hit.",
  "Art of Magic":"Halves non-elemental damage received.",
  "Paralysis Ring":"Attacks have a 25% chance to inflict Paralysis.",
  "Poison Ring":"Attacks have a 25% chance to inflict Poison.",
  "Silent Ring":"Attacks have a 25% chance to inflict Seal.",
  "Hand-Knit Scarf":"Reduces fixed RP costs by 50% and Forge, Crafting, Chemistry, and Cooking RP costs by 25%; percentage-based costs are unaffected.",
  "Fluffy Scarf":"Reduces fixed RP costs by 100% and Forge, Crafting, Chemistry, and Cooking RP costs by 50%; percentage-based costs are unaffected.",
  "Free Farming Shoes":"Bypasses the rigid 4×4 hoe grid, allowing free placement of seeds and trees.",
  "Piyo Sandals":"Replaces the normal movement sound with chirping squeaks.",
  "Secret Shoes":"Offsets the player model and shadow upward slightly, making the character appear taller.",
  "Heavy Boots":"Negates weak environmental wind movement.",
  "Sneaking Boots":"Reduces monsters' detection radius to 0.",
  "Fast Step Boots":"Increases single-dash travel distance by approximately 40%.",
  "Snow Boots":"Negates slipping while running on ice.",
  "Strider Boots":"Increases invincibility during dashes.",
  "Step-In Boots":"Prevents dash attacks.",
  "Ghost Boots":"Increases movement speed.",
  "Iron Geta":"Decreases movement speed.",
  "Wet Boots":"May cause an uncontrollable forward slip and brief loss of control.",
  "Water Shoes":"Allows walking on water.",
  "Ice Skates":"Causes a short forward slide after movement input stops.",
  "Rocket Wing":"Significantly increases movement speed.",
};
const EQUIPMENT_MATERIALS: Material[] = RECIPES.map(recipe => ({
  id:`equipment-${recipe.id}`,
  name:recipe.name,
  level:10,
  rarity:0,
  difficulty:0,
  effects:{},
  category:"Equipment",
  note:`${recipe.group} donor · Lv counts toward level bonus; rarity is always treated as 0${EQUIPMENT_ABILITIES[recipe.name] ? ` · ${EQUIPMENT_ABILITIES[recipe.name]}` : ""}`,
  equipment:{group:recipe.group,base:{...recipe.base},element:recipe.element,ability:EQUIPMENT_ABILITIES[recipe.name]},
}));

const KEYS: { key: EffectKey; label: string; unit?: string }[] = [
  { key: "atk", label: "ATK" }, { key: "matk", label: "M.ATK" }, { key: "def", label: "DEF" }, { key: "mdef", label: "M.DEF" },
  { key: "str", label: "STR" }, { key: "vit", label: "VIT" }, { key: "int", label: "INT" }, { key: "crit", label: "Critical", unit: "%" },
  { key: "diz", label: "Dizzy", unit: "%" }, { key: "stun", label: "Stun", unit: "%" }, { key: "knock", label: "Knock", unit: "%" }, { key: "range", label: "Range" },
  { key: "poisonAtk", label: "Poison ATK", unit: "%" }, { key: "sealAtk", label: "Seal ATK", unit: "%" }, { key: "paralysisAtk", label: "Paralysis ATK", unit: "%" },
  { key: "sleepAtk", label: "Sleep ATK", unit: "%" }, { key: "fatigueAtk", label: "Fatigue ATK", unit: "%" }, { key: "sickAtk", label: "Sick ATK", unit: "%" },
  { key: "faintAtk", label: "Faint ATK", unit: "%" }, { key: "drainAtk", label: "Drain ATK", unit: "%" },
  ...["fire", "water", "earth", "wind", "light", "dark", "love"].map(x => ({ key: `${x}Res` as EffectKey, label: `${x[0].toUpperCase()+x.slice(1)} RES`, unit: "%" })),
  { key: "noRes", label: "Non-elemental RES", unit: "%" },
  ...["poison", "seal", "paralysis", "sleep", "fatigue", "sick", "faint", "drain", "crit", "diz", "knock"].map(x => ({ key: `${x}Res` as EffectKey, label: `${x[0].toUpperCase()+x.slice(1)} RES`, unit: "%" })),
];

const DATABASE_EFFECT_GROUPS: { title:string; keys:EffectKey[] }[] = [
  {title:"Stats",keys:["atk","matk","def","mdef","str","vit","int","crit","diz","stun","knock","range"]},
  {title:"Status infliction",keys:["poisonAtk","sealAtk","paralysisAtk","sleepAtk","fatigueAtk","sickAtk","faintAtk","drainAtk"]},
  {title:"Elemental resistance",keys:["fireRes","waterRes","earthRes","windRes","lightRes","darkRes","loveRes","noRes"]},
  {title:"Status resistance",keys:["poisonRes","sealRes","paralysisRes","sleepRes","fatigueRes","sickRes","faintRes","drainRes","critRes","dizRes","knockRes"]},
];

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
const addEffects = (to: Effects, from: Effects, factor = 1) => { for (const key of Object.keys(from) as EffectKey[]) to[key] = (to[key] || 0) + (from[key] || 0) * factor; };
const fmt = (n: number, unit = "") => `${n > 0 ? "+" : ""}${Number.isInteger(n) ? n : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}${unit}`;
const displayNumber = (n: number) => n.toLocaleString(undefined,{maximumFractionDigits:2});
const canonicalMaterialName = (name: string) => name === "Black Tortoise Shell" ? "Blk. Tortoise Shell" : name === "Giant 4-Leaf Clover" ? "Great 4-Leaf Clover" : name;
const normalizeMaterialName = (value: string) => value.normalize("NFKD").toLowerCase().replace(/\+/g," plus ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const materialSearchMatch = (material: Material, query: string) => {
  const tokens = normalizeMaterialName(query).split(" ").filter(Boolean);
  const name = normalizeMaterialName(material.name);
  return tokens.every(token => name.includes(token));
};

function levelBonus(total: number, type: ItemType): Effects {
  const tiers = type === "armor"
    ? [[150,350,350],[120,180,170],[90,36,28],[60,15,12],[30,6,6]]
    : [[150,700,650],[120,200,180],[90,70,40],[60,25,10],[30,10,5]];
  const hit = tiers.find(t => total >= t[0]);
  return !hit ? {} : type === "armor" ? { def: hit[1], mdef: hit[2] } : { atk: hit[1], matk: hit[2] };
}

function rarityBonus(total: number, type: ItemType): Effects {
  const weapon = [[200,2000,1800],[175,1000,950],[150,500,400],[125,300,160],[100,150,100],[75,80,35],[50,30,15],[25,10,5]];
  const armor = [[200,800],[175,400],[150,150],[125,90],[100,50],[75,20],[50,10],[25,3]];
  if (type === "armor") { const hit = armor.find(t => total >= t[0]); return hit ? { def: hit[1] } : {}; }
  const hit = weapon.find(t => total >= t[0]);
  return hit ? { atk: hit[1], ...(type === "staff" ? { matk: hit[2] } : {}) } : {};
}

const WEAPON_GROUPS = new Set<RecipeGroup>(["Short Sword","Long Sword","Spear","Axe","Hammer","Dual Blades","Gloves","Staff","Tool"]);
const LIGHT_ORE_GROUPS = new Set<RecipeGroup>(["Short Sword","Long Sword","Spear","Axe","Hammer","Dual Blades","Gloves","Staff"]);
const BASE_OVERRIDE_GROUPS = new Set<RecipeGroup>([...LIGHT_ORE_GROUPS,"Armor","Shield","Headgear"]);

function calculate(type: ItemType, group: RecipeGroup | undefined, recipeName: string | undefined, base: Effects, baseElement: Element, forge: Slot[], lineage: Slot[], upgrades: Slot[], unlocked: boolean) {
  const warnings: string[] = [];
  const specialEffects: string[] = [];
  if (recipeName && EQUIPMENT_ABILITIES[recipeName]) specialEffects.push(`${recipeName}: ${EQUIPMENT_ABILITIES[recipeName]}`);
  const hasLightOre = forge.some(s => !s.requiredLabel && s.material.name === "Light Ore");
  const equipmentDonors = forge.filter(s => !s.requiredLabel && s.material.equipment);
  if (group && BASE_OVERRIDE_GROUPS.has(group) && equipmentDonors.length > 1) warnings.push(`${group} supports only one base-stat donor equipment in its extra crafting slots.`);
  const overrideSlot = forge.find(s => !s.requiredLabel && s.overrideSelected && s.material.equipment);
  let effectiveBase: Effects = { ...base };
  let effectiveElement = baseElement;
  if (overrideSlot?.material.equipment) {
    const source = overrideSlot.material.equipment;
    let valid = false;
    if (!group) warnings.push("Choose an equipment recipe before applying a base-stat override.");
    else if (source.group === group && BASE_OVERRIDE_GROUPS.has(group)) valid = true;
    else if (LIGHT_ORE_GROUPS.has(group) && LIGHT_ORE_GROUPS.has(source.group)) {
      valid = hasLightOre;
      if (!valid) warnings.push(`A ${source.group} cannot override a ${group} without Light Ore in a crafting slot.`);
    } else if (["Armor","Shield","Headgear"].includes(group)) warnings.push(`${group} can only override base stats from another ${group}; cross-category armor overrides are prohibited.`);
    else if (group === "Shoes" || group === "Accessory") warnings.push(`${group} cannot inherit base stats; it can only inherit special effects from same-category equipment.`);
    else warnings.push(`${source.group} cannot override ${group}; Light Ore only bridges different Weapon and Staff categories.`);
    if (valid) {
      effectiveBase = { ...source.base };
      effectiveElement = source.element || "none";
      specialEffects.push(`Base-stat override: ${overrideSlot.material.name} (${source.group})${source.group !== group ? " via Light Ore" : ""}.`);
    }
  }
  const lightOreUsed = Boolean(overrideSlot?.material.equipment && group && LIGHT_ORE_GROUPS.has(group) && LIGHT_ORE_GROUPS.has(overrideSlot.material.equipment.group) && overrideSlot.material.equipment.group !== group && hasLightOre);
  if (hasLightOre && (type === "armor" || group === "Tool")) warnings.push("Light Ore only works on Weapons and Staffs; remove it from this crafting recipe.");
  else if (hasLightOre && !lightOreUsed) warnings.push("Light Ore is present but inactive; select an equipment ingredient from a different weapon or Staff category as the base-stat override.");

  const effects: Effects = { ...effectiveBase };
  const trace: string[] = [];
  const selectedInheritance = [...forge, ...lineage].filter(s => s.contributes && !s.requiredLabel && !s.material.id.startsWith("required-"));
  if (selectedInheritance.length > 3) warnings.push("Only three Barrett-confirmed items can be inherited; deselect candidates until three or fewer remain.");
  if (lineage.some(s => s.contributes) && !forge.some(s => s.material.equipment)) warnings.push("Prior-equipment candidates require an equipment ingredient in the current crafting recipe.");
  const inherited = selectedInheritance.slice(0, 3);
  let inverted = false;
  let previousPrinted: Effects | null = null;
  const repeats: Record<string, number> = {};
  let usedDouble = false, usedTenfold = false;
  let inheritanceObjectXCount = 0, upgradeObjectXCount = 0;
  let element = effectiveElement;
  const hasPrintedEffect = (printed:Effects|null) => Boolean(printed && Object.values(printed).some(value=>Math.abs(value || 0)>0.0001));

  const applySlot = (slot: Slot, phase: "Forge" | "Upgrade") => {
    const m = slot.material;
    const canonicalName=canonicalMaterialName(m.name);
    const special:Special|undefined=m.special||(canonicalName==="Object X"?"objectx":canonicalName==="Double Steel"?"double":canonicalName==="10-Fold Steel"?"tenfold":undefined);
    if (m.equipment) {
      const abilityMatch = Boolean(m.equipment.ability) && group === m.equipment.group && !WEAPON_GROUPS.has(m.equipment.group);
      if (abilityMatch) specialEffects.push(`${m.name} (inherited): ${m.equipment.ability}`);
      else if (!m.equipment.ability) warnings.push(`${m.name} has no additional equipment ability recorded to inherit.`);
      else warnings.push(`${m.name}'s ${m.equipment.group} ability cannot be inherited by ${group || "a custom build"}; equipment abilities require the matching category.`);
      trace.push(`Inheritance: ${m.name}${abilityMatch ? " ability selected" : " contributed no compatible ability or upgrade stats"}.`);
      previousPrinted = null;
      return;
    }
    if (special === "objectx") {
      inverted = !inverted;
      if(phase === "Upgrade")upgradeObjectXCount++; else inheritanceObjectXCount++;
      trace.push(`${phase === "Forge" ? "Inheritance" : phase}: Object X ${inverted ? "enabled" : "cancelled"} reversal for subsequent materials in this phase.`);
      previousPrinted = null;
      return;
    }
    if (special === "double" || special === "tenfold") {
      const isDouble = special === "double";
      const already = isDouble ? usedDouble : usedTenfold;
      if (phase !== "Upgrade" || already || !hasPrintedEffect(previousPrinted)) {
        trace.push(`${phase}: ${m.name} had no multiplier effect.`);
        warnings.push(`${m.name} is inactive here: place it directly after an upgrade material with a printed effect and use each steel only once.`);
        previousPrinted = null;
        return;
      }
      const factor = isDouble ? 2 : 8;
      addEffects(effects, previousPrinted!, factor);
      if (isDouble) usedDouble = true; else usedTenfold = true;
      trace.push(`${phase}: ${m.name} added ${factor}× the prior printed effect${inverted ? " (steel ignores Object X)" : ""}.`);
      specialEffects.push(`${m.name}: ${factor}× the preceding printed material effect.`);
      previousPrinted = null;
      return;
    }
    const repeatKey = canonicalMaterialName(m.name);
    const count = repeats[repeatKey] || 0;
    const decay = phase === "Upgrade" ? Math.pow(0.5, count) : 1;
    const factor = inverted ? -decay : decay;
    addEffects(effects, m.effects, factor);
    if (phase === "Upgrade" && type !== "armor" && m.name === "Raccoon Leaf") {
      effects.range = (effects.range || 0) + 0.25 * decay;
      trace.push(`Upgrade special: Raccoon Leaf added ${fmt(0.25 * decay)} weapon range.`);
    }
    if (phase === "Upgrade" && type !== "armor" && m.name === "Glitta Augite") {
      effects.range = (effects.range || 0) + 0.5 * decay;
      trace.push(`Upgrade special: Glitta Augite added ${fmt(0.5 * decay)} weapon range.`);
    }
    if (phase === "Upgrade") repeats[repeatKey] = count + 1;
    previousPrinted = m.effects;
    if (m.element && type !== "armor") element = element === "none" ? m.element : "none";
    trace.push(`${phase}: ${m.name} applied at ${Math.round(decay * 100)}%${inverted ? ", reversed by Object X" : ""}.`);
  };

  inherited.forEach(s => applySlot(s, "Forge"));
  inverted = false;
  previousPrinted = null;
  upgrades.forEach(s => applySlot(s, "Upgrade"));

  const all = [...forge, ...upgrades].filter(s => !s.material.id.startsWith("required-"));
  const totalLevel = all.reduce((sum, s) => sum + s.material.level, 0);
  const totalRarity = all.reduce((sum, s) => sum + (s.material.equipment ? 0 : s.material.rarity), 0);
  const lb = unlocked ? levelBonus(totalLevel, type) : {};
  const rb = unlocked ? rarityBonus(totalRarity, type) : {};
  addEffects(effects, lb); addEffects(effects, rb);

  const coreOrder = upgrades.map(s => s.material.core).filter((core): core is NonNullable<Material["core"]> => Boolean(core));
  const orderedCoreBonus = type === "armor" && coreOrder.join(",") === "green,red,yellow,blue";
  if (orderedCoreBonus) {
    effects.noRes = (effects.noRes || 0) + 10;
    trace.push("Upgrade special: Green → Red → Yellow → Blue Cores added +10% non-elemental RES.");
  }
  const isWeapon = type !== "armor";
  const fixedDamageOne = isWeapon && upgrades.some(s => s.material.name === "Scrap Metal+");
  const clovers = new Set(["4-Leaf Clover", "Great 4-Leaf Clover", "Giant 4-Leaf Clover"]);
  const dropRateBoost = isWeapon && upgrades.some(s => clovers.has(s.material.name));
  const scaleShieldInheritance = group === "Shield" && upgrades.some(s => s.material.category === "Scales" && !["Wet Scale", "Wet Scales"].includes(s.material.name));
  if (fixedDamageOne) trace.push("Upgrade special: Scrap Metal+ fixes this weapon's damage at exactly 1.");
  if (dropRateBoost) trace.push("Upgrade special: clover increased this weapon's item drop rate effect.");
  if (scaleShieldInheritance) trace.push("Upgrade special: a non-Wet Scale lets dual blades and fists inherit 50% of this shield's total stats.");
  if (fixedDamageOne) specialEffects.push("Fixed damage: this weapon always deals exactly 1 damage.");
  if (dropRateBoost) specialEffects.push("Item drop rate increased by approximately 11% from a clover weapon upgrade.");
  if (scaleShieldInheritance) specialEffects.push("Dual blades and fists inherit 50% of this shield's total stats.");
  if (orderedCoreBonus) specialEffects.push("Core sequence: +10% non-elemental resistance.");
  if (inheritanceObjectXCount) specialEffects.push(`Inheritance Object X used ${inheritanceObjectXCount}×: reversal was contained within the donor material sequence and reset before upgrades.`);
  if (upgradeObjectXCount) specialEffects.push(`Object X used ${upgradeObjectXCount}×: reversal is ${upgradeObjectXCount%2 ? "active after the final Object X" : "cancelled for subsequent upgrades"}.`);
  if ((effects.range || 0) !== (effectiveBase.range || 0)) specialEffects.push(`Weapon attack range changed by ${fmt((effects.range || 0) - (effectiveBase.range || 0))}.`);
  if (element !== effectiveElement) specialEffects.push(`Weapon element changed to ${element === "none" ? "non-elemental" : element}.`);
  if (inverted) specialEffects.push("Object X reversal is active for subsequent standard effects.");

  const hasUpgrade = (name:string) => upgrades.some(s=>s.material.name===name);
  if (hasUpgrade("Invisible Stone")) specialEffects.push("Invisible Stone: the finished equipment is invisible.");
  if (hasUpgrade("White Stone")) specialEffects.push("White Stone: greatly reduced damage applies when this is equipped by a family member.");
  if (isWeapon && hasUpgrade("Shade Stone")) specialEffects.push("Shade Stone: attacks decrease enemy elemental tolerance.");
  if (isWeapon && hasUpgrade("Rare Can")) specialEffects.push("Rare Can: this weapon has an improved rare-item drop chance.");
  if (!isWeapon && hasUpgrade("Shade Stone")) warnings.push("Shade Stone's tolerance-reduction special effect applies to weapons only.");
  if (!isWeapon && hasUpgrade("Rare Can")) warnings.push("Rare Can's rare-drop special effect applies to weapons only.");

  const upgradeOnly = new Set(["Scrap Metal+","Raccoon Leaf","Glitta Augite","4-Leaf Clover","Great 4-Leaf Clover","Giant 4-Leaf Clover","Invisible Stone","White Stone","Shade Stone","Rare Can"]);
  const misplaced = [...forge.filter(s => !s.requiredLabel), ...lineage.filter(s => s.contributes)].filter(s => upgradeOnly.has(s.material.name));
  if (misplaced.length) warnings.push(`${Array.from(new Set(misplaced.map(s => s.material.name))).join(", ")} special effects require the upgrade section.`);
  const weaponOnlyUpgrades = upgrades.filter(s => upgradeOnly.has(s.material.name));
  if (!isWeapon && weaponOnlyUpgrades.length) warnings.push(`${Array.from(new Set(weaponOnlyUpgrades.map(s => s.material.name))).join(", ")} special effects apply to weapons only.`);
  if (upgrades.some(s => s.material.name === "Light Ore")) warnings.push("Light Ore must be used during crafting and only enables cross-category Weapon or Staff stat overrides.");
  if (lineage.some(s => s.contributes && s.material.name === "Light Ore")) warnings.push("Light Ore cannot be inherited from prior equipment; place it directly in the current crafting recipe.");
  if (type === "armor" && [...inherited,...upgrades].some(s=>s.material.element)) warnings.push("Elemental Crystal imbuement applies to weapons only; only the Crystal's printed stats apply here.");
  if (coreOrder.length && !orderedCoreBonus) warnings.push(type !== "armor" ? "The colored Core resistance bonus applies to armor only." : `Colored Cores must be exactly Green → Red → Yellow → Blue; current Core order is ${coreOrder.map(c=>c[0].toUpperCase()+c.slice(1)).join(" → ")}.`);
  const scaleUpgrades = upgrades.filter(s => s.material.category === "Scales");
  if (scaleUpgrades.some(s => ["Wet Scale","Wet Scales"].includes(s.material.name))) warnings.push("Wet Scale does not enable shield-stat inheritance.");
  if (scaleUpgrades.some(s => !["Wet Scale","Wet Scales"].includes(s.material.name)) && group !== "Shield") warnings.push("Non-Wet Scale shield inheritance only activates when the selected recipe is a Shield.");

  const coreConversions: Effects = {
    atk:effects.str || 0,
    matk:effects.int || 0,
    def:(effects.vit || 0) * 0.5,
    mdef:(effects.vit || 0) * 0.5,
  };
  const finalEffects: Effects = {...effects};
  addEffects(finalEffects,coreConversions);
  trace.push(`Core conversion: STR ${fmt(coreConversions.atk || 0)} ATK; INT ${fmt(coreConversions.matk || 0)} M.ATK; VIT ${fmt(coreConversions.def || 0)} DEF and ${fmt(coreConversions.mdef || 0)} M.DEF.`);

  return { effects, finalEffects, coreConversions, element, effectiveBase, totalLevel, totalRarity, lb, rb, trace, inheritedCount: inherited.length, fixedDamageOne, dropRateBoost, scaleShieldInheritance, orderedCoreBonus, specialEffects:Array.from(new Set(specialEffects)), warnings:Array.from(new Set(warnings)) };
}

let seedId = 0;
const slot = (id: string, level = 10, contributes = true): Slot => ({ uid: `${id}-seed-${seedId++}`, material: { ...BUILTIN_MATERIALS.find(p => p.id === id)!, level }, contributes });

function specialDescription(material: Material) {
  const parts:string[] = [];
  if (material.special === "double") parts.push("Adds 2× the previous material's printed upgrade effect");
  if (material.special === "tenfold") parts.push("Adds 8× the previous material's printed upgrade effect");
  if (material.special === "objectx") parts.push("Reverses subsequent standard upgrade effects; another Object X cancels it");
  if (material.element) parts.push(`${material.element[0].toUpperCase()+material.element.slice(1)} weapon element`);
  if (material.core) parts.push(`${material.core[0].toUpperCase()+material.core.slice(1)} Core sequence component`);
  const explicit:Record<string,string> = {
    "Scrap Metal+":"Weapon upgrade: fixes damage at exactly 1",
    "Raccoon Leaf":"Weapon upgrade: attack range +0.25",
    "Glitta Augite":"Weapon upgrade: attack range +0.5",
    "4-Leaf Clover":"Weapon upgrade: item drop rate approximately +11%",
    "Great 4-Leaf Clover":"Weapon upgrade: item drop rate approximately +11%",
    "Giant 4-Leaf Clover":"Alias of Great 4-Leaf Clover",
    "Light Ore":"Crafting only: enables cross-category Weapon/Staff base-stat inheritance",
    "Invisible Stone":"Makes the finished equipment invisible",
    "White Stone":"Greatly reduces damage when worn by a family member",
    "Shade Stone":"Weapon attacks reduce enemy elemental tolerance",
    "Rare Can":"Weapon upgrade: improves rare-item drop chance",
  };
  if (explicit[material.name]) parts.push(explicit[material.name]);
  if (material.category === "Scales" && material.name !== "Wet Scale") parts.push("Shield upgrade: dual blades/fists inherit 50% of shield stats");
  if (!parts.length && material.note && !/^(Regular|Giant) (crop|flower)$/.test(material.note) && !material.note.startsWith("Eligible for")) parts.push(material.note);
  return Array.from(new Set(parts)).join(" · ") || "—";
}

function effectsFor(material:Material, keys:EffectKey[]) {
  const shown = keys.filter(key=>Math.abs(material.effects[key] || 0) > 0.0001);
  return shown.length ? shown.map(key=>{const meta=KEYS.find(item=>item.key===key)!; return `${meta.label} ${fmt(material.effects[key]!,meta.unit)}`;}).join(" · ") : "—";
}

function MaterialDatabase({materials}:{materials:Material[]}) {
  const [query,setQuery] = useState("");
  const [category,setCategory] = useState<string>("all");
  const [selected,setSelected] = useState<EffectKey[]>([]);
  const [sortKey,setSortKey] = useState<"name" | EffectKey>("name");
  const [sortDirection,setSortDirection] = useState<"asc" | "desc">("asc");
  const toggle = (key:EffectKey) => setSelected(current=>current.includes(key) ? current.filter(item=>item!==key) : [...current,key]);
  const rows = useMemo(()=>materials.filter(material=>{
    if (material.category === "Equipment") return false;
    if (query.trim() && !normalizeMaterialName(material.name).includes(normalizeMaterialName(query.trim()))) return false;
    if (category !== "all" && !getMaterialDatabaseCategories(material.name,material.category).includes(category)) return false;
    return selected.every(key=>Math.abs(material.effects[key] || 0) > 0.0001);
  }).sort((a,b)=>{
    const comparison = sortKey === "name" ? a.name.localeCompare(b.name) : (a.effects[sortKey] || 0) - (b.effects[sortKey] || 0) || a.name.localeCompare(b.name);
    return sortDirection === "asc" ? comparison : -comparison;
  }),[materials,query,category,selected,sortKey,sortDirection]);
  const unresolved = useMemo(()=>materials.filter(material=>material.category!=="Equipment" && !getMaterialSource(material.name)).map(material=>material.name).sort((a,b)=>a.localeCompare(b)),[materials]);
  const sortOptions = selected.length ? selected : KEYS.map(item=>item.key);
  return <div className="database-workspace">
    <section className="panel database-panel">
      <div className="database-head"><div><span className="eyebrow">REFERENCE LIBRARY</span><h2>Material database</h2><p>Search names or select multiple fixed effects. Multiple effects use strict AND matching.</p></div><strong>{rows.length} result{rows.length===1?"":"s"}</strong></div>
      <div className="database-controls"><label><span>Material name</span><input placeholder="Search material name…" value={query} onChange={event=>setQuery(event.target.value)}/></label><label><span>Category</span><select value={category} onChange={event=>setCategory(event.target.value)}><option value="all">All categories</option>{[...CATEGORIES.filter(item=>!['Equipment','Raw Ingredients'].includes(item)),...DATABASE_INGREDIENT_CATEGORIES].map(item=><option key={item}>{item}</option>)}</select></label><label><span>Sort by</span><select value={sortKey} onChange={event=>setSortKey(event.target.value as "name"|EffectKey)}><option value="name">Material name</option>{sortOptions.map(key=><option value={key} key={key}>{KEYS.find(item=>item.key===key)?.label}</option>)}</select></label><button className="quiet sort-direction" onClick={()=>setSortDirection(value=>value==="asc"?"desc":"asc")}>{sortDirection === "asc" ? "↑ Ascending" : "↓ Descending"}</button></div>
      <div className="effect-filter-panel"><div className="effect-filter-head"><div><strong>Effect filters</strong><span>Every selected effect must be present</span></div>{selected.length>0&&<button className="quiet" onClick={()=>{setSelected([]);if(sortKey!=="name")setSortKey("name");}}>Clear {selected.length}</button>}</div>{DATABASE_EFFECT_GROUPS.map(group=><div className="effect-filter-group" key={group.title}><h3>{group.title}</h3><div>{group.keys.map(key=><button key={key} className={selected.includes(key)?"selected":""} aria-pressed={selected.includes(key)} onClick={()=>toggle(key)}>{KEYS.find(item=>item.key===key)?.label}</button>)}</div></div>)}</div>
      <div className="source-coverage"><p>Acquisition entries use the supplied <a href="https://therunefactory.fandom.com/wiki/Monsters_(RF4)" target="_blank" rel="noreferrer">RF4 monster table</a>, <a href="https://therunefactory.fandom.com/wiki/Crops_(RF4)" target="_blank" rel="noreferrer">RF4 crops table</a>, and <a href="https://therunefactory.fandom.com/wiki/Mining_(RF4)" target="_blank" rel="noreferrer">RF4 mining table</a>, plus the manually supplied special sources. Valid monster drops remain listed alongside the more common mining method.</p><details><summary>{unresolved.length} materials have no recorded acquisition source</summary><div>{unresolved.length ? unresolved.map(name=><span key={name}>{name}</span>) : <span>All recorded materials now have a source.</span>}</div></details></div>
      <div className="database-table-wrap"><table className="database-table"><thead><tr><th>Material</th><th>Category</th><th>Acquisition / location</th><th>Stats</th><th>Status infliction</th><th>Elemental resistance</th><th>Status resistance</th><th>Special effects</th></tr></thead><tbody>{rows.map(material=><tr key={material.id}><td><strong>{material.name}</strong><small>Difficulty {material.difficulty ?? 0} · R{material.rarity}</small></td><td>{getMaterialDatabaseCategories(material.name,material.category).join(" · ") || "—"}</td><td className={!getMaterialSource(material.name)?"source-missing":""}>{getMaterialSource(material.name) || "No acquisition source recorded"}</td><td>{effectsFor(material,DATABASE_EFFECT_GROUPS[0].keys)}</td><td>{effectsFor(material,DATABASE_EFFECT_GROUPS[1].keys)}</td><td>{effectsFor(material,DATABASE_EFFECT_GROUPS[2].keys)}</td><td>{effectsFor(material,DATABASE_EFFECT_GROUPS[3].keys)}</td><td>{specialDescription(material)}</td></tr>)}</tbody></table>{rows.length===0&&<div className="database-empty"><strong>No materials match every selected condition.</strong><span>Remove an effect button or broaden the name/category filter.</span></div>}</div>
    </section>
  </div>;
}

export default function Home() {
  const [mode, setMode] = useState<"manual" | "optimizer" | "materials">("manual");
  const [type, setType] = useState<ItemType>("weapon");
  const [skillUnlocked, setSkillUnlocked] = useState(true);
  const [baseElement, setBaseElement] = useState<Element>("none");
  const [base, setBase] = useState<Effects>({ atk: 100, matk: 20 });
  const [forge, setForge] = useState<Slot[]>([slot("firewyrm",10), slot("fire-crystal",10), slot("light-crystal",10)]);
  const [lineage, setLineage] = useState<Slot[]>([]);
  const [upgrades, setUpgrades] = useState<Slot[]>([slot("tenfold-steel",10), slot("electro",10), slot("double-steel",10)]);
  const [recipeId, setRecipeId] = useState("");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [customMaterials, setCustomMaterials] = useState<Material[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("r4fs-custom-materials") || "[]"); } catch { return []; }
  });
  const [picker, setPicker] = useState<"forge" | "lineage" | "upgrade" | null>(null);
  const [pickerCategory, setPickerCategory] = useState<MaterialCategory | null>(null);
  const [replaceUid, setReplaceUid] = useState<string | null>(null);
  const [customTarget, setCustomTarget] = useState<"forge" | "lineage" | "upgrade" | "library">("forge");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Slot | null>(null);
  const [details, setDetails] = useState(true);
  const [uidCounter, setUidCounter] = useState(100);
  const selectedRecipe = RECIPES.find(r => r.id === recipeId);
  const selectedGroup = selectedRecipe?.group;
  const result = useMemo(() => calculate(type, selectedGroup, selectedRecipe?.name, base, baseElement, forge, lineage, upgrades, skillUnlocked), [type, selectedGroup, selectedRecipe?.name, base, baseElement, forge, lineage, upgrades, skillUnlocked]);
  const visibleRecipes = useMemo(() => {
    const query = recipeSearch.trim().toLowerCase();
    return query ? RECIPES.filter(r => `${r.name} ${r.group}`.toLowerCase().includes(query) || r.id === recipeId) : RECIPES;
  }, [recipeSearch, recipeId]);

  const materialLibrary = useMemo(() => {
    const seen = new Set<string>();
    return [...customMaterials, ...BUILTIN_MATERIALS, ...EQUIPMENT_MATERIALS].filter(m => {
      const normalized = normalizeMaterialName(canonicalMaterialName(m.name));
      const key = m.equipment ? `equipment:${m.equipment.group}:${normalized}` : `material:${normalized}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [customMaterials]);
  const saveCustomLibrary = (m: Material) => {
    const next = [m, ...customMaterials.filter(x => x.id !== m.id && x.name !== m.name)];
    setCustomMaterials(next);
    localStorage.setItem("r4fs-custom-materials", JSON.stringify(next));
  };

  const openPicker = (target: "forge" | "lineage" | "upgrade", category: MaterialCategory | null = null, uid: string | null = null) => {
    setPicker(target); setPickerCategory(category); setReplaceUid(uid); setSearch("");
  };

  const addMaterial = (m: Material) => {
    const selectedCount = [...forge,...lineage].filter(x=>x.contributes && !x.material.id.startsWith("required-")).length;
    const canOverrideStats = Boolean(m.equipment && selectedGroup && BASE_OVERRIDE_GROUPS.has(selectedGroup));
    const s: Slot = { uid: `${m.id}-${uidCounter}`, material: { ...m }, contributes: !m.equipment && m.name !== "Light Ore" && selectedCount < 3, overrideSelected:canOverrideStats ? !forge.some(x=>x.overrideSelected) : undefined };
    setUidCounter(uidCounter + 1);
    if (picker === "forge" && replaceUid) setForge(forge.map(x => x.uid === replaceUid ? {...s, uid:x.uid, contributes:x.requiredLabel ? false : x.contributes, requiredCategory:x.requiredCategory, requiredLabel:x.requiredLabel, overrideSelected:x.overrideSelected} : x));
    else if (picker === "forge" && forge.length < 6) setForge([...forge, s]);
    if (picker === "lineage" && replaceUid) setLineage(lineage.map(x=>x.uid===replaceUid ? {...s,uid:x.uid,overrideSelected:undefined,contributes:x.contributes} : x));
    else if (picker === "lineage" && lineage.length < 12) setLineage([...lineage, {...s,overrideSelected:undefined,contributes:selectedCount < 3}]);
    if (picker === "upgrade" && replaceUid) setUpgrades(upgrades.map(x=>x.uid===replaceUid ? {...s,uid:x.uid,contributes:x.contributes} : x));
    else if (picker === "upgrade" && upgrades.length < 9) setUpgrades([...upgrades, s]);
    setPicker(null); setPickerCategory(null); setReplaceUid(null); setSearch("");
  };
  const updateSlot = (target: "forge" | "lineage" | "upgrade", uid: string, patch: Partial<Slot>) => {
    const fn = (items: Slot[]) => items.map(s => s.uid === uid ? { ...s, ...patch } : s);
    if (target === "forge") setForge(fn(forge)); else if (target === "lineage") setLineage(fn(lineage)); else setUpgrades(fn(upgrades));
  };
  const removeSlot = (target: "forge" | "lineage" | "upgrade", uid: string) => target === "forge" ? setForge(forge.filter(s => s.uid !== uid)) : target === "lineage" ? setLineage(lineage.filter(s=>s.uid!==uid)) : setUpgrades(upgrades.filter(s => s.uid !== uid));
  const inheritanceCount = [...forge,...lineage].filter(s=>s.contributes && !s.requiredLabel && !s.material.id.startsWith("required-")).length;
  const setInherited = (target:"forge"|"lineage", uid:string, value:boolean) => {
    if (value && inheritanceCount >= 3) return;
    updateSlot(target,uid,{contributes:value});
  };
  const selectOverride = (uid:string) => setForge(forge.map(s=>({...s,overrideSelected:s.uid===uid})));
  const loadRecipe = (id: string) => {
    setRecipeId(id);
    const recipe = RECIPES.find(r => r.id === id);
    if (!recipe) return;
    setType(recipe.type); setBase({...recipe.base}); setBaseElement(recipe.element || "none");
    setForge(recipe.requirements.map((requirement, index) => {
      if (requirement.category) return {uid:`recipe-${id}-${index}`,material:{id:`required-${index}`,name:`Choose ${requirement.category}`,level:0,rarity:0,effects:{},category:requirement.category,note:"Required category selection"},contributes:false,requiredCategory:requirement.category,requiredLabel:requirement.category};
      const found = materialLibrary.find(m => !m.equipment && m.name === requirement.exact);
      const material = found || {id:`recipe-${requirement.exact!.toLowerCase().replace(/[^a-z]+/g,"-")}`,name:requirement.exact!,level:10,rarity:0,effects:{},category:"Misc." as MaterialCategory,note:"Required recipe material; enter rarity and effects if needed"};
      return {uid:`recipe-${id}-${index}`,material:{...material},contributes:false,requiredLabel:requirement.exact};
    }));
    setLineage([]);
    setUpgrades([]);
  };

  const saveEditedMaterial = (m: Material) => {
    if (!editing) return;
    const inForge = forge.some(s=>s.uid===editing.uid);
    const inLineage = lineage.some(s=>s.uid===editing.uid);
    if (editing.uid === "pending") {
      saveCustomLibrary(m);
      const newSlot = {uid:`custom-${uidCounter}`,material:m,contributes:inheritanceCount<3};
      if (customTarget === "forge" && replaceUid) setForge(forge.map(x=>x.uid===replaceUid ? {...newSlot,uid:x.uid,contributes:x.requiredLabel ? false : x.contributes,requiredCategory:x.requiredCategory,requiredLabel:x.requiredLabel,overrideSelected:x.overrideSelected} : x));
      else if (customTarget === "forge" && forge.length<6) setForge([...forge,newSlot]);
      if (customTarget === "lineage" && replaceUid) setLineage(lineage.map(x=>x.uid===replaceUid ? {...newSlot,uid:x.uid,contributes:x.contributes} : x));
      else if (customTarget === "lineage" && lineage.length<12) setLineage([...lineage,newSlot]);
      if (customTarget === "upgrade" && replaceUid) setUpgrades(upgrades.map(x=>x.uid===replaceUid ? {...newSlot,uid:x.uid,contributes:x.contributes} : x));
      else if (customTarget === "upgrade" && upgrades.length<9) setUpgrades([...upgrades,{...newSlot,contributes:true}]);
      setUidCounter(uidCounter+1);
    } else {
      updateSlot(inForge ? "forge" : inLineage ? "lineage" : "upgrade",editing.uid,{material:m});
      if (m.id.startsWith("custom-")) saveCustomLibrary(m);
    }
    setReplaceUid(null); setPickerCategory(null); setEditing(null);
  };

  const renderSlots = (target: "forge" | "upgrade", items: Slot[], limit: number) => (
    <div className="slot-list">
      {items.map((s, index) => <div className="material-row" key={s.uid}>
        <div className={`mat-index ${s.material.special || "normal"}`}>{index + 1}</div>
        <button className="material-main" onClick={() => s.requiredCategory ? openPicker("forge",s.requiredCategory,s.uid) : setEditing(s)}>
          <strong>{s.material.name}</strong><span>Lv {s.material.level} · R{s.material.rarity}{s.material.difficulty !== undefined ? ` · Difficulty ${s.material.difficulty}` : ""} · {s.material.note || "Recorded upgrade effects"}</span>
        </button>
        {s.requiredLabel && <span className={`requirement-badge ${s.requiredCategory && s.material.id.startsWith("required-") ? "missing" : ""}`}>Required: {s.requiredLabel}</span>}
        {target === "forge" && !s.requiredLabel && s.material.equipment && selectedGroup && BASE_OVERRIDE_GROUPS.has(selectedGroup) && <label className="inherit-toggle" title="Use this equipment's original base stats"><input type="radio" name="stat-override" checked={Boolean(s.overrideSelected)} onChange={()=>selectOverride(s.uid)}/><span>Base stats</span></label>}
        {target === "forge" && !s.requiredLabel && !(s.material.equipment && selectedGroup && BASE_OVERRIDE_GROUPS.has(selectedGroup)) && <label className="inherit-toggle" title="Match this toggle to the item Barrett reports"><input type="checkbox" checked={s.contributes} disabled={!s.contributes && inheritanceCount >= 3} onChange={e => setInherited("forge", s.uid, e.target.checked)}/><span>Barrett</span></label>}
        {(!s.requiredLabel || s.requiredCategory) && <button className="icon-button replace-button" title={`Replace ${s.material.name} in this slot`} aria-label={`Replace ${s.material.name}`} onClick={() => openPicker(target,s.requiredCategory || null,s.uid)}>↻</button>}
        {!s.requiredLabel && <button className="icon-button" aria-label={`Remove ${s.material.name}`} onClick={() => removeSlot(target, s.uid)}>×</button>}
      </div>)}
      {items.length < limit && <button className="add-row" onClick={() => openPicker(target)}><span>＋</span><div><strong>Add {target === "forge" ? "crafting material" : "upgrade"}</strong><small>{items.length}/{limit} slots used</small></div></button>}
    </div>
  );

  return <main>
    <header className="topbar">
      <div className="brand"><div className="anvil">✦</div><div><h1>R4FS Forge Calculator</h1><p>Plan inheritance, upgrades, and hidden bonuses</p></div></div>
      <div className="segmented mode-switch"><button className={mode==="manual"?"active":""} onClick={()=>setMode("manual")}>Manual calculator</button><button className={mode==="optimizer"?"active":""} onClick={()=>setMode("optimizer")}>Build optimizer</button><button className={mode==="materials"?"active":""} onClick={()=>setMode("materials")}>Material database</button></div>
    </header>

    {mode === "optimizer" ? <BuildOptimizer/> : mode === "materials" ? <MaterialDatabase materials={materialLibrary.filter(material=>material.category!=="Equipment")}/> : <>
    <div className="workspace">
      <section className="panel recipe-panel">
        <div className="section-head"><div><span className="eyebrow">BUILD INPUT</span><h2>Forge recipe</h2></div><div className="segmented">{(["weapon","staff","armor"] as ItemType[]).map(t => <button key={t} className={type===t?"active":""} onClick={() => {setRecipeId("");setType(t);}}>{t === "armor" ? "Armor / accessory" : t[0].toUpperCase()+t.slice(1)}</button>)}</div></div>
        <div className="recipe-select-card">
          <div><span className="eyebrow">EQUIPMENT RECIPE</span><strong>{recipeId ? RECIPES.find(r=>r.id===recipeId)?.name : "Custom build"}</strong><small>Selecting a recipe fills exact ingredients and locks category requirements.</small></div>
          <div className="recipe-controls"><input aria-label="Filter equipment recipes" placeholder={`Filter ${RECIPES.length} recipes…`} value={recipeSearch} onChange={e=>setRecipeSearch(e.target.value)}/><select aria-label="Equipment recipe" value={recipeId} onChange={e=>loadRecipe(e.target.value)}><option value="">Custom build</option>{Array.from(new Set(visibleRecipes.map(r=>r.group))).map(group=><optgroup label={group} key={group}>{visibleRecipes.filter(r=>r.group===group).map(r=><option key={r.id} value={r.id}>{r.name} · Lv {r.level}</option>)}</optgroup>)}</select></div>
        </div>
        <div className="base-card">
          <div className="base-icon">⚔</div><div className="base-fields"><label>Base item stats</label><div className="inline-fields">{(["atk","matk","def","mdef"] as EffectKey[]).map(k => <label key={k}><span>{KEYS.find(x=>x.key===k)?.label}</span><input type="number" value={base[k] || 0} onChange={e => setBase({...base,[k]:Number(e.target.value)})}/></label>)}</div></div>
          <label className="element-select"><span>Base element</span><select value={baseElement} onChange={e=>setBaseElement(e.target.value as Element)}><option value="none">None</option>{ELEMENTS.map(e=><option key={e.key} value={e.key}>{e.label}</option>)}</select></label>
        </div>

        <div className="phase-block"><div className="phase-title"><div><span className="step">1</span><h3>Crafting materials</h3></div><p>Required recipe ingredients are consumed without granting upgrade effects. Only extra slots and carried candidates can be selected with the Barrett toggles.</p></div>{renderSlots("forge",forge,6)}
          <div className="inheritance-planner"><div className="inheritance-head"><div><span className="eyebrow">INHERITANCE POOL</span><h4>Prior equipment candidates</h4><p>Add materials or matching shoes/accessories carried by an equipment ingredient, then toggle only the results Barrett confirms.</p></div><strong>{inheritanceCount}/3 selected</strong></div>
            {lineage.map(s=><div className="lineage-row" key={s.uid}><label><input type="checkbox" checked={s.contributes} disabled={!s.contributes && inheritanceCount>=3} onChange={e=>setInherited("lineage",s.uid,e.target.checked)}/><span><b>{s.material.name}</b><small>{s.material.equipment ? s.material.equipment.ability || `${s.material.equipment.group} has no additional recorded ability` : "Prior inherited upgrade-effect candidate"}</small></span></label><div className="slot-actions"><button className="icon-button replace-button" title={`Replace ${s.material.name} in this slot`} aria-label={`Replace ${s.material.name}`} onClick={()=>openPicker("lineage",null,s.uid)}>↻</button><button className="icon-button" aria-label={`Remove ${s.material.name}`} onClick={()=>removeSlot("lineage",s.uid)}>×</button></div></div>)}
            <button className="add-row compact-add" onClick={()=>openPicker("lineage")}><span>＋</span><div><strong>Add candidate from equipment</strong><small>Use for an ingredient equipment's Barrett-listed materials or abilities</small></div></button>
          </div>
        </div>
        <div className="phase-block"><div className="phase-title"><div><span className="step">2</span><h3>Upgrade order</h3></div><p>Order matters. Repeats decay to 50%, 25%, 12.5%… while steels reference the prior printed effect.</p></div>{renderSlots("upgrade",upgrades,9)}</div>
      </section>

      <aside className="panel results-panel">
        <div className="section-head compact"><div><span className="eyebrow">LIVE OUTPUT</span><h2>Build results</h2></div><label className="unlock"><input type="checkbox" checked={skillUnlocked} onChange={e=>setSkillUnlocked(e.target.checked)}/><span>Skill 50+</span></label></div>
        {forge.some(s=>s.requiredCategory && s.material.id.startsWith("required-")) && <div className="requirement-warning"><strong>Recipe incomplete</strong><span>Choose a valid material for every highlighted category slot.</span></div>}
        {result.warnings.length > 0 && <div className="rule-warnings"><strong>Adjust this build</strong><ul>{result.warnings.map((warning,i)=><li key={i}>{warning}</li>)}</ul></div>}
        {result.specialEffects.length > 0 && <div className="special-effects"><strong>Active inherited &amp; upgrade effects</strong><ul>{result.specialEffects.map((effect,i)=><li key={i}>{effect}</li>)}</ul></div>}
        <div className="primary-stats">{(type === "armor" ? ["def","mdef"] : ["atk","matk"]).map(k => { const key=k as EffectKey; const source=k==="atk"?"STR":k==="matk"?"INT":"VIT × 0.5"; return <div key={k}><span>{KEYS.find(x=>x.key===key)?.label}</span><strong>{displayNumber(result.finalEffects[key] || 0)}</strong><small>Raw total {displayNumber(result.effects[key] || 0)} · {source} {fmt(result.coreConversions[key] || 0)}</small></div>; })}</div>
        <div className="element-banner"><span>{type === "armor" ? "Equipment element" : "Weapon element"}</span><strong className={`element-pill ${result.element}`}>{result.element === "none" ? "Non-elemental" : result.element[0].toUpperCase()+result.element.slice(1)}</strong></div>

        <ResultGroup title="Core stats" keys={["str","vit","int","crit","diz","stun","knock","range"]} effects={result.effects}/>
        <ResultGroup title="Status infliction" keys={["poisonAtk","sealAtk","paralysisAtk","sleepAtk","fatigueAtk","sickAtk","faintAtk","drainAtk"]} effects={result.effects}/>
        <ResultGroup title="Elemental resistance" keys={["fireRes","waterRes","earthRes","windRes","lightRes","darkRes","loveRes","noRes"]} effects={result.effects}/>
        <ResultGroup title="Status resistance" keys={["poisonRes","sealRes","paralysisRes","sleepRes","fatigueRes","sickRes","faintRes","drainRes","critRes","dizRes","knockRes"]} effects={result.effects}/>

        <div className="bonus-card"><div><span>Level bonus</span><strong>{result.totalLevel}/150</strong></div><div className="meter"><i style={{width:`${Math.min(100,result.totalLevel/1.5)}%`}}/></div><small>{skillUnlocked ? effectSummary(result.lb) || "Below the first 30-point tier" : "Disabled until Forging/Crafting Lv. 50"}</small></div>
        <div className="bonus-card"><div><span>Rarity bonus</span><strong>{result.totalRarity}/225</strong></div><div className="meter rarity"><i style={{width:`${Math.min(100,result.totalRarity/2.25)}%`}}/></div><small>{skillUnlocked ? effectSummary(result.rb) || "Below the first 25-point tier" : "Disabled until Forging/Crafting Lv. 50"}</small></div>
        <button className="details-toggle" onClick={()=>setDetails(!details)}><span>Calculation trace</span><span>{details?"−":"＋"}</span></button>
        {details && <ol className="trace">{result.trace.map((line,i)=><li key={i}>{line}</li>)}<li>Final: level total {result.totalLevel}; rarity total {result.totalRarity}.</li></ol>}
        <div className="accuracy-note"><strong>Rule notes</strong><p>Final primary stats include core-stat conversion after all other effects: 1 STR = 1 ATK, 1 INT = 1 M.ATK, and 1 VIT = 0.5 DEF + 0.5 M.DEF. Weapons and Staffs can override same-category base stats directly or cross-category stats with Light Ore. Armor, Shields, and Headgear only support same-category base-stat overrides. Shoes and Accessories keep their own base stats and can inherit up to three same-category abilities. Donor level counts toward the level bonus; donor rarity and upgrade effects do not. Only a donor's native element transfers with a valid stat override.</p></div>
      </aside>
    </div>

    {picker && <div className="modal-backdrop" onMouseDown={()=>setPicker(null)}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">MATERIAL LIBRARY</span><h2>{pickerCategory ? `${replaceUid ? "Replace with" : "Choose"} ${pickerCategory}` : picker === "lineage" ? `${replaceUid ? "Replace" : "Add"} prior inheritance candidate` : `${replaceUid ? "Replace slot in" : "Add to"} ${picker === "forge" ? "crafting" : "upgrade order"}`}</h2>{pickerCategory && <p className="modal-help">Only materials categorized as {pickerCategory} are eligible for this recipe slot.</p>}{replaceUid&&<p className="modal-help">Only this slot changes; every later material stays in its current position.</p>}</div><button className="icon-button" onClick={()=>setPicker(null)}>×</button></div><input autoFocus className="search" placeholder="Search item name…" value={search} onChange={e=>setSearch(e.target.value)}/><div className="preset-grid">{materialLibrary.filter(p=>(picker!=="upgrade" || !p.equipment) && (!pickerCategory || p.category===pickerCategory) && materialSearchMatch(p,search)).map(p=><button key={`${p.id}:${normalizeMaterialName(p.name)}`} onClick={()=>addMaterial(p)}><strong>{p.name}</strong><span>R{p.rarity}</span><small>{p.category || "Uncategorized"}{p.difficulty !== undefined ? ` · Difficulty ${p.difficulty}` : ""} · {p.note || "Upgrade effects recorded"}</small></button>)}</div><button className="custom-cta" onClick={()=>{ const custom: Material={id:`custom-${Date.now()}`,name:"Custom material",level:10,rarity:0,difficulty:0,effects:{},category:pickerCategory || "Misc."}; setCustomTarget(picker); setPicker(null); setEditing({uid:"pending",material:custom,contributes:true}); }}>＋ Create and save a new {pickerCategory || "custom"} material</button></div></div>}
    {editing && <MaterialEditor slot={editing} onClose={()=>setEditing(null)} onSave={saveEditedMaterial}/>}
    </>}
  </main>;
}

function effectSummary(e: Effects) { return KEYS.filter(k=>e[k.key]).map(k=>`${k.label} ${fmt(e[k.key]!,k.unit)}`).join(" · "); }

function ResultGroup({title,keys,effects}:{title:string;keys:EffectKey[];effects:Effects}) {
  const visible = keys.filter(k => Math.abs(effects[k] || 0) > 0.0001);
  return <div className="result-group"><div className="group-title"><h3>{title}</h3><span>{visible.length ? `${visible.length} active` : "None"}</span></div>{visible.length ? <div className="chip-grid">{visible.map(k=>{const meta=KEYS.find(x=>x.key===k)!;return <div className="stat-chip" key={k}><span>{meta.label}</span><strong className={(effects[k]||0)<0?"negative":""}>{fmt(effects[k]!,meta.unit)}</strong></div>})}</div>:<p className="empty-state">No contribution in this build.</p>}</div>
}

type OptimizerObjective = "achieve" | "power" | "lowRarity" | "maximize";
type OptimizerCoreKey = "atk" | "matk" | "def" | "mdef";
type OptimizerElement = Element | "any";
type OptimizerInput = { recipe: Recipe; targets: Effects; element: OptimizerElement; useOverride: boolean; donorId: string; abilityNames: string[]; objective: OptimizerObjective; maximizeKeys: OptimizerCoreKey[] };
type OptimizerPlan = {
  error?: string;
  feasible: boolean;
  recipe: Recipe;
  donor?: Material;
  usesLightOre: boolean;
  required: Slot[];
  abilityDonors: Slot[];
  directExtras: Slot[];
  carried: Slot[];
  fillers: Slot[];
  upgrades: Slot[];
  result: ReturnType<typeof calculate>;
  unmet: {key:EffectKey;target:number;actual:number}[];
  elementMet: boolean;
  objective: OptimizerObjective;
  maximizeKeys: OptimizerCoreKey[];
};

const OPTIMIZER_TARGET_GROUPS: {title:string;keys:EffectKey[]}[] = [
  {title:"Primary & core stats",keys:["atk","matk","def","mdef","str","vit","int","crit","range"]},
  {title:"Status infliction",keys:["poisonAtk","sealAtk","paralysisAtk","sleepAtk","fatigueAtk","sickAtk","faintAtk","drainAtk"]},
  {title:"Elemental resistance",keys:["fireRes","waterRes","earthRes","windRes","lightRes","darkRes","loveRes","noRes"]},
  {title:"Status resistance",keys:["poisonRes","sealRes","paralysisRes","sleepRes","fatigueRes","sickRes","faintRes","drainRes","critRes","dizRes","knockRes"]},
];
const OPTIMIZER_UPGRADE_ONLY = new Set(["Scrap Metal+","Raccoon Leaf","Glitta Augite","4-Leaf Clover","Great 4-Leaf Clover","Giant 4-Leaf Clover","Invisible Stone","White Stone","Shade Stone","Rare Can","Double Steel","10-Fold Steel"]);
const OPTIMIZER_MATERIALS = BUILTIN_MATERIALS.filter(m=>!m.equipment && m.name!=="Light Ore");
const optimizerSlot = (material:Material, uid:string, contributes:boolean, patch:Partial<Slot>={}):Slot => ({uid,material:{...material,level:10},contributes,...patch});
const optimizerValue = (result:ReturnType<typeof calculate>, key:EffectKey) => ["atk","matk","def","mdef"].includes(key) ? result.finalEffects[key] || 0 : result.effects[key] || 0;
const optimizerHasPrintedEffect = (material:Material) => Object.values(material.effects).some(value=>Math.abs(value || 0)>0.0001);
const optimizerObjectXActive = (prefix:Material[]) => prefix.filter(material=>material.special==="objectx").length%2===1;
const optimizerBenefitsFromReversal = (material:Material) => {
  const values=Object.values(material.effects).filter(value=>Math.abs(value || 0)>0.0001);
  return values.length>0&&values.every(value=>value<0);
};
const optimizerCanAppendUpgrade = (prefix:Material[],material:Material) => {
  if(material.special!=="double"&&material.special!=="tenfold")return true;
  if(prefix.some(item=>item.special===material.special))return false;
  const previous=prefix[prefix.length-1];
  return Boolean(previous&&previous.special!=="double"&&previous.special!=="tenfold"&&previous.special!=="objectx"&&optimizerHasPrintedEffect(previous));
};
const materialTargetValue = (material:Material,key:EffectKey) => {
  if (key==="atk") return (material.effects.atk||0)+(material.effects.str||0);
  if (key==="matk") return (material.effects.matk||0)+(material.effects.int||0);
  if (key==="def") return (material.effects.def||0)+(material.effects.vit||0)*0.5;
  if (key==="mdef") return (material.effects.mdef||0)+(material.effects.vit||0)*0.5;
  if (key==="range") return (material.effects.range||0)+(material.name==="Raccoon Leaf"?.25:material.name==="Glitta Augite"?.5:0);
  return material.effects[key]||0;
};

function optimizerRequiredSlots(recipe:Recipe):Slot[] {
  return recipe.requirements.map((requirement,index)=>{
    let material:Material|undefined;
    if (requirement.exact) material=[...EQUIPMENT_MATERIALS,...BUILTIN_MATERIALS].find(m=>m.name===requirement.exact);
    else if (requirement.category) material=BUILTIN_MATERIALS.filter(m=>m.category===requirement.category).sort((a,b)=>b.rarity-a.rarity)[0];
    material ||= {id:`optimizer-required-${index}`,name:requirement.exact||requirement.category||"Required material",level:10,rarity:0,effects:{},category:requirement.category||"Misc."};
    return optimizerSlot(material,`optimizer-required-${index}`,false,{requiredLabel:requirement.exact||requirement.category});
  });
}

function optimizerCandidates(targets:Effects,element:OptimizerElement,maximizeKeys:OptimizerCoreKey[]):Material[] {
  const chosen=new Map<string,Material>();
  const add=(m:Material|undefined)=>{if(m)chosen.set(normalizeMaterialName(m.name),m)};
  ["Double Steel","10-Fold Steel","Object X","Mealy Apple"].forEach(name=>add(OPTIMIZER_MATERIALS.find(m=>m.name===name)));
  if ((targets.noRes||0)>=10) ["Green Core","Red Core","Yellow Core","Blue Core"].forEach(name=>add(OPTIMIZER_MATERIALS.find(m=>m.name===name)));
  if (element!=="any" && element!=="none") add(OPTIMIZER_MATERIALS.find(m=>m.element===element));
  maximizeKeys.forEach(key=>{
    OPTIMIZER_MATERIALS.slice().sort((a,b)=>materialTargetValue(b,key)-materialTargetValue(a,key)).filter(m=>materialTargetValue(m,key)>0).slice(0,12).forEach(add);
  });
  (Object.keys(targets) as EffectKey[]).filter(k=>(targets[k]||0)>0).forEach(key=>{
    OPTIMIZER_MATERIALS.slice().sort((a,b)=>materialTargetValue(b,key)-materialTargetValue(a,key)).filter(m=>materialTargetValue(m,key)>0).slice(0,7).forEach(add);
  });
  OPTIMIZER_MATERIALS.slice().sort((a,b)=>b.rarity-a.rarity).slice(0,4).forEach(add);
  return Array.from(chosen.values()).slice(0,38);
}

function optimizerScore(result:ReturnType<typeof calculate>,targets:Effects,element:OptimizerElement,objective:OptimizerObjective,maximizeKeys:OptimizerCoreKey[],final=false) {
  let score=0, achieved=0;
  for (const key of Object.keys(targets) as EffectKey[]) {
    const target=targets[key]||0;
    if(target<=0)continue;
    const actual=optimizerValue(result,key);
    score+=Math.max(0,target-actual)/Math.max(1,Math.abs(target))*100000;
    achieved+=Math.min(actual,target*2)/Math.max(1,target);
  }
  if(element!=="any" && result.element!==element)score+=5000;
  if(final)score+=result.warnings.length*300;
  if(objective==="maximize") {
    for(const key of maximizeKeys) {
      score-=optimizerValue(result,key);
    }
  }
  if(objective==="power")score-=achieved*3;
  if(objective==="lowRarity")score+=result.totalRarity*.03;
  return score;
}

function optimizeBuild(input:OptimizerInput):OptimizerPlan {
  const {recipe,targets,element,useOverride,donorId,abilityNames,objective,maximizeKeys}=input;
  const required=optimizerRequiredSlots(recipe);
  if(objective==="maximize"&&!maximizeKeys.length) return emptyOptimizerPlan(recipe,required,"Choose one or two effective core stats to maximize.",objective,maximizeKeys);
  const abilityMaterials=abilityNames.map(name=>EQUIPMENT_MATERIALS.find(m=>m.name===name)).filter((m):m is Material=>Boolean(m));
  if(abilityMaterials.length>3) return emptyOptimizerPlan(recipe,required,"Choose no more than three inherited equipment abilities.");
  if(abilityMaterials.some(m=>m.equipment?.group!==recipe.group)) return emptyOptimizerPlan(recipe,required,"Shoes and Accessories can only inherit same-category abilities.");

  let donorMaterials:(Material|undefined)[]=[undefined];
  if(useOverride) {
    if(!BASE_OVERRIDE_GROUPS.has(recipe.group)) return emptyOptimizerPlan(recipe,required,`${recipe.group} does not support base-stat overriding.`);
    const compatible=EQUIPMENT_MATERIALS.filter(m=>{
      const source=m.equipment?.group;
      if(!source)return false;
      if(["Armor","Shield","Headgear"].includes(recipe.group))return source===recipe.group;
      return LIGHT_ORE_GROUPS.has(recipe.group)&&LIGHT_ORE_GROUPS.has(source);
    });
    if(donorId!=="auto") donorMaterials=[compatible.find(m=>m.id===donorId)].filter((m):m is Material=>Boolean(m));
    else donorMaterials=compatible.sort((a,b)=>{
      const priorityKeys:OptimizerCoreKey[]=objective==="maximize"&&maximizeKeys.length?maximizeKeys:["atk","matk","def","mdef"];
      const donorScore=(m:Material)=>priorityKeys.reduce((sum,key)=>sum+materialTargetValue({effects:m.equipment?.base||{}} as Material,key),0);
      return donorScore(b)-donorScore(a);
    }).slice(0,8);
    if(!donorMaterials.length)return emptyOptimizerPlan(recipe,required,"No compatible donor equipment is available.");
  }

  const candidates=optimizerCandidates(targets,element,maximizeKeys);
  const craftCandidates=candidates.filter(m=>!OPTIMIZER_UPGRADE_ONLY.has(m.name));
  const filler=OPTIMIZER_MATERIALS.filter(m=>!m.special).sort((a,b)=>b.rarity-a.rarity)[0];
  let best:OptimizerPlan|undefined;
  let bestScore=Infinity;

  for(const donor of donorMaterials) {
    const usesLightOre=Boolean(donor?.equipment&&donor.equipment.group!==recipe.group);
    const lightOre=BUILTIN_MATERIALS.find(m=>m.name==="Light Ore");
    const preAbilityCount=required.length+(donor?1:0)+(usesLightOre?1:0);
    const openBeforeAbilities=6-preAbilityCount;
    const directAbilityCount=abilityMaterials.length<=openBeforeAbilities?abilityMaterials.length:openBeforeAbilities>=1&&abilityMaterials.length>0?1:0;
    if(abilityMaterials.length>0&&directAbilityCount===0)continue;
    const directAbilityMaterials=abilityMaterials.slice(0,directAbilityCount);
    const carriedAbilityMaterials=abilityMaterials.slice(directAbilityCount);
    const structuralCount=preAbilityCount+directAbilityMaterials.length;
    if(structuralCount>6)continue;
    const donorSlot=donor?optimizerSlot(donor,"optimizer-donor",false,{overrideSelected:true}):undefined;
    const abilityDonors=directAbilityMaterials.map((m,i)=>optimizerSlot(m,`optimizer-ability-${i}`,true));
    const carriedAbilitySlots=carriedAbilityMaterials.map((m,i)=>optimizerSlot(m,`optimizer-carried-ability-${i}`,true));
    const structural=[...required,...(donorSlot?[donorSlot]:[]),...(usesLightOre&&lightOre?[optimizerSlot(lightOre,"optimizer-light-ore",false)]:[]),...abilityDonors];
    const free=6-structural.length;
    const inheritanceCapacity=Math.max(0,3-abilityMaterials.length);
    const hasEquipment=Boolean(donor||abilityDonors.length);
    const effectSlots=hasEquipment?inheritanceCapacity:Math.min(inheritanceCapacity,free);
    const directCount=Math.min(effectSlots,free);
    const carriedCount=effectSlots-directCount;
    const fillerCount=free-directCount;
    const fillers=Array.from({length:fillerCount},(_,i)=>optimizerSlot(filler,`optimizer-filler-${i}`,false));
    type CraftState={materials:Material[];result:ReturnType<typeof calculate>;score:number};
    const selectCraftStates=(states:CraftState[],limit:number)=>{
      const selected:CraftState[]=[];
      const seen=new Set<string>();
      const add=(state:CraftState)=>{
        const key=state.materials.map(material=>material.name).join("→");
        if(!seen.has(key)){seen.add(key);selected.push(state)}
      };
      states.filter(state=>state.materials[0]?.name==="Object X"&&state.materials[1]?.name==="Mealy Apple").forEach(add);
      states.filter(state=>state.materials.map(material=>material.name).join("→")==="Object X→Mealy Apple→Mealy Apple").forEach(add);
      states.slice().sort((a,b)=>a.score-b.score).slice(0,Math.ceil(limit*.6)).forEach(add);
      states.filter(state=>state.materials.some(material=>material.special==="objectx")).sort((a,b)=>a.score-b.score).slice(0,Math.ceil(limit*.2)).forEach(add);
      if(objective==="maximize")states.slice().sort((a,b)=>maximizeKeys.reduce((sum,key)=>sum+optimizerValue(b.result,key)-optimizerValue(a.result,key),0)).forEach(add);
      states.slice().sort((a,b)=>a.score-b.score).forEach(add);
      return selected.slice(0,limit);
    };
    const initialCraft:CraftState={materials:[],result:calculate(recipe.type,recipe.group,recipe.name,recipe.base,recipe.element||"none",[...structural,...fillers],carriedAbilitySlots,[],true),score:0};
    const craftBuckets:CraftState[][]=Array.from({length:effectSlots+1},()=>[]);
    craftBuckets[0]=[initialCraft];
    const craftObjectX=craftCandidates.find(material=>material.special==="objectx");
    const craftMealyApple=craftCandidates.find(material=>material.name==="Mealy Apple");
    const ordinaryCraftCandidates=craftCandidates.filter(material=>material.special!=="objectx");
    for(let length=0;length<effectSlots;length++) {
      const states=selectCraftStates(craftBuckets[length],130);
      for(const state of states) {
        const active=optimizerObjectXActive(state.materials);
        const additions:Material[][]=[];
        if(active) {
          if(craftObjectX)additions.push([craftObjectX]);
          ordinaryCraftCandidates.filter(optimizerBenefitsFromReversal).forEach(material=>additions.push([material]));
        } else {
          ordinaryCraftCandidates.filter(material=>material.name!=="Mealy Apple").forEach(material=>additions.push([material]));
          if(craftObjectX&&craftMealyApple&&length+2<=effectSlots)additions.push([craftObjectX,craftMealyApple]);
        }
        for(const addition of additions) {
          if(length+addition.length>effectSlots)continue;
          const materials=[...state.materials,...addition];
          const direct=materials.slice(0,directCount).map((m,i)=>optimizerSlot(m,`optimizer-extra-${i}`,true));
          const carried=materials.slice(directCount).map((m,i)=>optimizerSlot(m,`optimizer-carried-${i}`,true));
          const result=calculate(recipe.type,recipe.group,recipe.name,recipe.base,recipe.element||"none",[...structural,...direct,...fillers],[...carriedAbilitySlots,...carried],[],true);
          craftBuckets[materials.length].push({materials,result,score:optimizerScore(result,targets,element,objective,maximizeKeys)});
        }
      }
      for(let nextLength=length+1;nextLength<=Math.min(effectSlots,length+2);nextLength++)craftBuckets[nextLength]=selectCraftStates(craftBuckets[nextLength],170);
    }
    let craftBeam=selectCraftStates(craftBuckets[effectSlots],120);
    if(!craftBeam.length)continue;

    const corePrefix=(targets.noRes||0)>=10&&recipe.type==="armor"?["Green Core","Red Core","Yellow Core","Blue Core"].map(name=>OPTIMIZER_MATERIALS.find(m=>m.name===name)!).filter(Boolean):[];
    type UpgradeState={craft:CraftState;materials:Material[];result:ReturnType<typeof calculate>;score:number};
    const selectUpgradeStates=(states:UpgradeState[],limit:number)=>{
      const selected:UpgradeState[]=[];
      const seen=new Set<string>();
      const add=(state:UpgradeState)=>{
        const key=`${state.craft.materials.map(material=>material.name).join("→")}|${state.materials.map(material=>material.name).join("→")}`;
        if(!seen.has(key)){seen.add(key);selected.push(state)}
      };
      const powerCompare=(a:UpgradeState,b:UpgradeState)=>maximizeKeys.reduce((sum,key)=>sum+optimizerValue(b.result,key)-optimizerValue(a.result,key),0);
      const guidedScore=(state:UpgradeState,powerWeight:number)=>{
        let gap=0;
        for(const key of Object.keys(targets) as EffectKey[]) {
          const target=targets[key]||0;
          if(target>0)gap+=Math.max(0,target-optimizerValue(state.result,key))/Math.max(1,target)*100000;
        }
        const power=maximizeKeys.reduce((sum,key)=>sum+optimizerValue(state.result,key),0);
        return gap-power*powerWeight;
      };
      const reversalDonorStates=states.filter(state=>state.craft.materials.map(material=>material.name).join("→")==="Object X→Mealy Apple→Mealy Apple");
      reversalDonorStates.slice().sort((a,b)=>a.score-b.score).slice(0,Math.ceil(limit*.15)).forEach(add);
      if(objective==="maximize") {
        [1,10,100,1000].forEach(weight=>reversalDonorStates.slice().sort((a,b)=>guidedScore(a,weight)-guidedScore(b,weight)).slice(0,Math.ceil(limit*.1)).forEach(add));
        reversalDonorStates.slice().sort(powerCompare).slice(0,Math.ceil(limit*.15)).forEach(add);
      }
      states.slice().sort((a,b)=>a.score-b.score).slice(0,Math.ceil(limit*.55)).forEach(add);
      states.filter(state=>state.craft.materials.some(material=>material.special==="objectx")).sort((a,b)=>a.score-b.score).slice(0,Math.ceil(limit*.25)).forEach(add);
      if(objective==="maximize")states.slice().sort(powerCompare).forEach(add);
      states.slice().sort((a,b)=>a.score-b.score).forEach(add);
      return selected.slice(0,limit);
    };
    let upgradeBeam:UpgradeState[]=selectCraftStates(craftBeam,80).map(craft=>({craft,materials:corePrefix,result:craft.result,score:craft.score}));
    if(corePrefix.length) upgradeBeam=upgradeBeam.map(state=>{
      const direct=state.craft.materials.slice(0,directCount).map((m,i)=>optimizerSlot(m,`optimizer-extra-${i}`,true));
      const carried=state.craft.materials.slice(directCount).map((m,i)=>optimizerSlot(m,`optimizer-carried-${i}`,true));
      const upgradeSlots=corePrefix.map((m,i)=>optimizerSlot(m,`optimizer-upgrade-${i}`,true));
      const result=calculate(recipe.type,recipe.group,recipe.name,recipe.base,recipe.element||"none",[...structural,...direct,...fillers],[...carriedAbilitySlots,...carried],upgradeSlots,true);
      return {...state,result,score:optimizerScore(result,targets,element,objective,maximizeKeys)};
    });
    const upgradeCandidates=corePrefix.length?candidates.filter(m=>!["Green Core","Red Core","Yellow Core","Blue Core"].includes(m.name)):candidates;
    const objectX=upgradeCandidates.find(material=>material.special==="objectx");
    const mealyApple=upgradeCandidates.find(material=>material.name==="Mealy Apple");
    const tenfoldSteel=upgradeCandidates.find(material=>material.special==="tenfold");
    const doubleSteel=upgradeCandidates.find(material=>material.special==="double");
    const ordinaryCandidates=upgradeCandidates.filter(material=>material.special!=="objectx");
    const steelBaseCandidates=ordinaryCandidates.filter(material=>material.special!=="double"&&material.special!=="tenfold"&&material.name!=="Mealy Apple"&&optimizerHasPrintedEffect(material)).slice(0,18);
    const buckets:UpgradeState[][]=Array.from({length:10},()=>[]);
    buckets[corePrefix.length]=upgradeBeam;
    for(let length=corePrefix.length;length<9;length++) {
      const states=selectUpgradeStates(buckets[length],130);
      for(const state of states) {
        const active=optimizerObjectXActive(state.materials);
        const additions:Material[][]=[];
        if(active) {
          if(objectX)additions.push([objectX]);
          ordinaryCandidates.filter(optimizerBenefitsFromReversal).forEach(material=>additions.push([material]));
        } else {
          ordinaryCandidates.filter(material=>material.name!=="Mealy Apple").forEach(material=>additions.push([material]));
          if(objectX&&mealyApple&&length<=7)additions.push([objectX,mealyApple]);
          if(length<=7)for(const material of steelBaseCandidates) {
            if(tenfoldSteel)additions.push([material,tenfoldSteel]);
            if(doubleSteel)additions.push([material,doubleSteel]);
          }
        }
        for(const addition of additions) {
          if(length+addition.length>9)continue;
          const materials=[...state.materials];
          let valid=true;
          for(const material of addition) {
            if(!optimizerCanAppendUpgrade(materials,material)){valid=false;break}
            materials.push(material);
          }
          if(!valid)continue;
          const direct=state.craft.materials.slice(0,directCount).map((m,i)=>optimizerSlot(m,`optimizer-extra-${i}`,true));
          const carried=state.craft.materials.slice(directCount).map((m,i)=>optimizerSlot(m,`optimizer-carried-${i}`,true));
          const upgradeSlots=materials.map((m,i)=>optimizerSlot(m,`optimizer-upgrade-${i}`,true));
          const result=calculate(recipe.type,recipe.group,recipe.name,recipe.base,recipe.element||"none",[...structural,...direct,...fillers],[...carriedAbilitySlots,...carried],upgradeSlots,true);
          const next:UpgradeState={craft:state.craft,materials,result,score:optimizerScore(result,targets,element,objective,maximizeKeys)};
          buckets[materials.length].push(next);
        }
      }
      for(let nextLength=length+1;nextLength<=Math.min(9,length+2);nextLength++)buckets[nextLength]=selectUpgradeStates(buckets[nextLength],190);
    }
    const guidedFinalists:UpgradeState[]=[];
    if(objective==="maximize"&&tenfoldSteel&&doubleSteel&&objectX&&mealyApple&&corePrefix.length===0&&donor===donorMaterials[0]) {
      const reversalCrafts=craftBeam.filter(craft=>craft.materials.map(material=>material.name).join("→")==="Object X→Mealy Apple→Mealy Apple").slice(0,1);
      const powerBases=steelBaseCandidates.slice().sort((a,b)=>maximizeKeys.reduce((sum,key)=>sum+materialTargetValue(b,key)-materialTargetValue(a,key),0)).slice(0,5);
      const targetValue=(material:Material)=>(Object.keys(targets) as EffectKey[]).reduce((sum,key)=>{
        const target=targets[key]||0;
        return target>0?sum+Math.max(0,materialTargetValue(material,key))/target:sum;
      },0);
      const targetBases=steelBaseCandidates.slice().sort((a,b)=>targetValue(b)-targetValue(a)).slice(0,7);
      const fillCandidates=ordinaryCandidates.filter(material=>material.special!=="double"&&material.special!=="tenfold"&&material.name!=="Mealy Apple");
      const evaluate=(craft:CraftState,materials:Material[])=>{
        const direct=craft.materials.slice(0,directCount).map((m,i)=>optimizerSlot(m,`optimizer-extra-${i}`,true));
        const carried=craft.materials.slice(directCount).map((m,i)=>optimizerSlot(m,`optimizer-carried-${i}`,true));
        const upgradeSlots=materials.map((m,i)=>optimizerSlot(m,`optimizer-upgrade-${i}`,true));
        const result=calculate(recipe.type,recipe.group,recipe.name,recipe.base,recipe.element||"none",[...structural,...direct,...fillers],[...carriedAbilitySlots,...carried],upgradeSlots,true);
        return {craft,materials,result,score:optimizerScore(result,targets,element,objective,maximizeKeys)} as UpgradeState;
      };
      const defensiveTemplate=["Earthwyrm Scale","10-Fold Steel","Left Rock Shard","Double Steel","Broken Box","Broken Hilt","Tyrant Turnip","Object X","Mealy Apple"].map(name=>OPTIMIZER_MATERIALS.find(material=>material.name===name));
      if(defensiveTemplate.every((material):material is Material=>Boolean(material)))for(const craft of reversalCrafts)guidedFinalists.push(evaluate(craft,defensiveTemplate));
      for(const craft of reversalCrafts)for(const powerBase of powerBases)for(const targetBase of targetBases) {
        let fillBeam=[evaluate(craft,[powerBase,tenfoldSteel,targetBase,doubleSteel])];
        for(let fillIndex=0;fillIndex<3;fillIndex++) {
          const expanded:{state:UpgradeState;lookahead:UpgradeState}[]=[];
          for(const state of fillBeam)for(const material of fillCandidates) {
            const materials=[...state.materials,material];
            expanded.push({state:evaluate(craft,materials),lookahead:evaluate(craft,[...materials,objectX,mealyApple])});
          }
          fillBeam=expanded.sort((a,b)=>a.lookahead.score-b.lookahead.score).slice(0,28).map(candidate=>candidate.state);
        }
        for(const state of fillBeam)if(state.materials.length===7)guidedFinalists.push(evaluate(craft,[...state.materials,objectX,mealyApple]));
      }
    }
    upgradeBeam=[...buckets[9],...guidedFinalists];
    const finalist=upgradeBeam.filter(state=>state.result.warnings.length===0).sort((a,b)=>optimizerScore(a.result,targets,element,objective,maximizeKeys,true)-optimizerScore(b.result,targets,element,objective,maximizeKeys,true))[0];
    if(!finalist)continue;
    const directExtras=finalist.craft.materials.slice(0,directCount).map((m,i)=>optimizerSlot(m,`optimizer-extra-${i}`,true));
    const carriedNumeric=finalist.craft.materials.slice(directCount,directCount+carriedCount).map((m,i)=>optimizerSlot(m,`optimizer-carried-${i}`,true));
    const carried=[...carriedAbilitySlots,...carriedNumeric];
    const upgrades=finalist.materials.map((m,i)=>optimizerSlot(m,`optimizer-upgrade-${i}`,true));
    const unmet=(Object.keys(targets) as EffectKey[]).filter(k=>(targets[k]||0)>optimizerValue(finalist.result,k)+.0001).map(key=>({key,target:targets[key]||0,actual:optimizerValue(finalist.result,key)}));
    const elementMet=element==="any"||finalist.result.element===element;
    const score=optimizerScore(finalist.result,targets,element,objective,maximizeKeys,true);
    const plan:OptimizerPlan={feasible:unmet.length===0&&elementMet&&finalist.result.warnings.length===0,recipe,donor,usesLightOre,required,abilityDonors,directExtras,carried,fillers,upgrades,result:finalist.result,unmet,elementMet,objective,maximizeKeys};
    if(score<bestScore){best=plan;bestScore=score}
  }
  return best||emptyOptimizerPlan(recipe,required,"No valid slot layout was found. Try disabling donors or reducing inherited abilities.");
}

function emptyOptimizerPlan(recipe:Recipe,required:Slot[],error:string,objective:OptimizerObjective="achieve",maximizeKeys:OptimizerCoreKey[]=[]):OptimizerPlan {
  const result=calculate(recipe.type,recipe.group,recipe.name,recipe.base,recipe.element||"none",required,[],[],true);
  return {error,feasible:false,recipe,usesLightOre:false,required,abilityDonors:[],directExtras:[],carried:[],fillers:[],upgrades:[],result,unmet:[],elementMet:true,objective,maximizeKeys};
}

function BuildOptimizer() {
  const [recipeId,setRecipeId]=useState("");
  const [recipeSearch,setRecipeSearch]=useState("");
  const [targets,setTargets]=useState<Effects>({});
  const [element,setElement]=useState<OptimizerElement>("any");
  const [useOverride,setUseOverride]=useState(false);
  const [donorId,setDonorId]=useState("auto");
  const [inheritAbilities,setInheritAbilities]=useState(false);
  const [abilityNames,setAbilityNames]=useState<string[]>([]);
  const [objective,setObjective]=useState<OptimizerObjective>("achieve");
  const [maximizeKeys,setMaximizeKeys]=useState<OptimizerCoreKey[]>([]);
  const [plan,setPlan]=useState<OptimizerPlan|null>(null);
  const [running,setRunning]=useState(false);
  const recipe=RECIPES.find(r=>r.id===recipeId);
  const visibleRecipes=RECIPES.filter(r=>!recipeSearch.trim()||`${r.name} ${r.group}`.toLowerCase().includes(recipeSearch.toLowerCase()));
  const donorOptions=recipe?EQUIPMENT_MATERIALS.filter(m=>{
    if(!m.equipment)return false;
    if(["Armor","Shield","Headgear"].includes(recipe.group))return m.equipment.group===recipe.group;
    return LIGHT_ORE_GROUPS.has(recipe.group)&&LIGHT_ORE_GROUPS.has(m.equipment.group);
  }):[];
  const abilityOptions=recipe&&["Accessory","Shoes"].includes(recipe.group)?EQUIPMENT_MATERIALS.filter(m=>m.equipment?.group===recipe.group&&m.equipment.ability):[];
  const toggleMaximizeKey=(key:OptimizerCoreKey)=>setMaximizeKeys(current=>current.includes(key)?current.filter(k=>k!==key):current.length<2?[...current,key]:[current[1],key]);
  const run=()=>{
    if(!recipe){setPlan(null);return}
    setRunning(true);
    setTimeout(()=>{
      setPlan(optimizeBuild({recipe,targets,element,useOverride,donorId,abilityNames:inheritAbilities?abilityNames:[],objective,maximizeKeys}));
      setRunning(false);
    },20);
  };
  return <div className="optimizer-workspace">
    <section className="panel optimizer-input">
      <div className="section-head"><div><span className="eyebrow">GOAL INPUT</span><h2>Build optimizer</h2><p className="optimizer-intro">Set minimum outcomes or maximize effective core stats. The search assumes Forging/Crafting Lv. 50+ and Level 10 materials.</p></div></div>
      <div className="optimizer-recipe"><label><span>Find equipment</span><input placeholder="Search recipe…" value={recipeSearch} onChange={e=>setRecipeSearch(e.target.value)}/></label><label><span>Equipment</span><select value={recipeId} onChange={e=>{setRecipeId(e.target.value);setPlan(null);setAbilityNames([]);setUseOverride(false)}}><option value="">Choose equipment…</option>{Array.from(new Set(visibleRecipes.map(r=>r.group))).map(group=><optgroup key={group} label={group}>{visibleRecipes.filter(r=>r.group===group).map(r=><option key={r.id} value={r.id}>{r.name} · Lv {r.level}</option>)}</optgroup>)}</select></label></div>
      <div className="optimizer-options"><label><span>Desired element</span><select value={element} onChange={e=>setElement(e.target.value as OptimizerElement)}><option value="any">Any</option><option value="none">Non-elemental</option>{ELEMENTS.map(e=><option key={e.key} value={e.key}>{e.label}</option>)}</select></label><label><span>Optimization goal</span><select value={objective} onChange={e=>{setObjective(e.target.value as OptimizerObjective);setPlan(null)}}><option value="achieve">Meet all minimums</option><option value="maximize">Maximize core stat(s)</option><option value="power">Exceed entered targets</option><option value="lowRarity">Meet targets with lower rarity</option></select></label></div>
      {objective==="maximize"&&<div className="maximize-stat-picker"><div><b>Effective stats to maximize</b><small>Choose one or two. ATK includes STR, M.ATK includes INT, and DEF/M.DEF each include 0.5 × VIT.</small></div><div>{(["atk","matk","def","mdef"] as OptimizerCoreKey[]).map(key=><button type="button" key={key} className={maximizeKeys.includes(key)?"selected":""} onClick={()=>toggleMaximizeKey(key)}>{KEYS.find(k=>k.key===key)?.label}</button>)}</div></div>}
      {recipe&&BASE_OVERRIDE_GROUPS.has(recipe.group)&&<div className="optimizer-toggle-card"><label><input type="checkbox" checked={useOverride} onChange={e=>setUseOverride(e.target.checked)}/><span><b>Use a base-stat donor</b><small>Consumes one extra crafting slot; cross-category Weapon/Staff donors also consume one Light Ore slot.</small></span></label>{useOverride&&<select value={donorId} onChange={e=>setDonorId(e.target.value)}><option value="auto">Auto-select best donor</option>{donorOptions.map(m=><option key={m.id} value={m.id}>{m.name} · {m.equipment?.group}</option>)}</select>}</div>}
      {recipe&&["Accessory","Shoes"].includes(recipe.group)&&<div className="optimizer-toggle-card"><label><input type="checkbox" checked={inheritAbilities} onChange={e=>{setInheritAbilities(e.target.checked);if(!e.target.checked)setAbilityNames([])}}/><span><b>Inherit extra special effects</b><small>Select up to three same-category effects. Each consumes an empty crafting slot and one Barrett inheritance result.</small></span></label>{inheritAbilities&&<select multiple size={6} value={abilityNames} onChange={e=>setAbilityNames(Array.from(e.target.selectedOptions).map(o=>o.value).slice(0,3))}>{abilityOptions.map(m=><option key={m.id} value={m.name}>{m.name} — {m.equipment?.ability}</option>)}</select>}</div>}
      <div className="optimizer-targets">{OPTIMIZER_TARGET_GROUPS.map((group,index)=><details key={group.title} open={index===0}><summary>{group.title}<span>{group.keys.filter(k=>(targets[k]||0)>0).length} targets</span></summary><div className="target-grid">{group.keys.map(key=>{const meta=KEYS.find(k=>k.key===key)!;return <label key={key}><span>{meta.label}{meta.unit||""}</span><input type="number" min="0" step="0.5" placeholder="No minimum" value={targets[key]||""} onChange={e=>setTargets({...targets,[key]:Math.max(0,Number(e.target.value))})}/></label>})}</div></details>)}</div>
      <button className="primary optimizer-run" disabled={!recipe||running||(objective==="maximize"&&!maximizeKeys.length)} onClick={run}>{running?"Searching materials and sequences…":objective==="maximize"?"Find highest effective stats":"Generate optimized plan"}</button>
      <p className="optimizer-disclaimer">A found plan is fully validated by the calculator. Maximization reports the highest result found by the bounded search, including derived STR/INT/VIT contributions; it is not a formal proof that no higher combination exists.</p>
    </section>
    <aside className="panel optimizer-output">
      {!plan?<div className="optimizer-empty"><span>✦</span><h2>No plan generated</h2><p>Choose equipment, set your goal, and run the optimizer.</p></div>:<OptimizerPlanView plan={plan} targets={targets}/>}
    </aside>
  </div>;
}

function OptimizerPlanView({plan,targets}:{plan:OptimizerPlan;targets:Effects}) {
  if(plan.error)return <div><span className="eyebrow">PLAN BLOCKED</span><h2>{plan.recipe.name}</h2><div className="rule-warnings"><strong>Adjust optimizer inputs</strong><ul><li>{plan.error}</li></ul></div></div>;
  const defaults:OptimizerCoreKey[]=plan.recipe.type==="armor"?["def","mdef"]:["atk","matk"];
  const primary=plan.objective==="maximize"?Array.from(new Set([...plan.maximizeKeys,...defaults])):defaults;
  const maximizing=plan.objective==="maximize";
  const barrett=[...plan.abilityDonors,...plan.directExtras,...plan.carried];
  return <div>
    <div className={`optimizer-status ${plan.feasible?"success":"partial"}`}><span>{maximizing?(plan.feasible?"MAXIMUM SEARCH RESULT":"BEST VALID CANDIDATE"):plan.feasible?"TARGETS ACHIEVED":"BEST PLAN FOUND"}</span><h2>{plan.recipe.name}</h2><p>{maximizing?`Highest effective ${plan.maximizeKeys.map(key=>KEYS.find(k=>k.key===key)?.label).join(" + ")} found while respecting your other minimums.`:plan.feasible?"Every requested minimum is satisfied.":"Review the remaining shortfalls below."}</p></div>
    <div className="optimizer-final-stats">{primary.map(key=><div key={key} className={plan.maximizeKeys.includes(key)?"maximized":""}><span>{KEYS.find(k=>k.key===key)?.label}{plan.maximizeKeys.includes(key)?" · maximized":""}</span><strong>{displayNumber(plan.result.finalEffects[key]||0)}</strong><small>Raw {displayNumber(plan.result.effects[key]||0)} + derived {displayNumber(plan.result.coreConversions[key]||0)}</small></div>)}</div>
    {(plan.unmet.length>0||!plan.elementMet)&&<div className="rule-warnings"><strong>Unmet targets</strong><ul>{plan.unmet.map(item=><li key={item.key}>{KEYS.find(k=>k.key===item.key)?.label}: {displayNumber(item.actual)} / {displayNumber(item.target)}</li>)}{!plan.elementMet&&<li>Element: produced {plan.result.element}</li>}</ul></div>}
    <PlanSection title="1. Required recipe" items={plan.required.map(s=>s.material.name)} note="Consumed recipe ingredients; their printed upgrade effects are not applied."/>
    {(plan.donor||plan.abilityDonors.length>0)&&<PlanSection title="2. Equipment inheritance" items={[...(plan.donor?[`${plan.donor.name} — base-stat donor${plan.usesLightOre?" with Light Ore":""}`]:[]),...plan.abilityDonors.map(s=>`${s.material.name} — inherit special effect`)]} note="Donor equipment contributes Level 10 and Rarity 0."/>}
    <PlanSection title="3. Extra crafting slots" items={[...plan.directExtras.map(s=>`${s.material.name} — Barrett selected`),...plan.fillers.map(s=>`${s.material.name} — level/rarity filler only`)]} note={plan.directExtras.length?"These extra materials supply inherited upgrade effects.":"No direct extra material effect is required."}/>
    {plan.carried.length>0&&<PlanSection title="Carried through donor equipment" items={plan.carried.map(s=>s.material.name)} note="Build these into the donor first, then accept this best-case Barrett inheritance result on the final item."/>}
    <PlanSection title="4. Barrett result to accept" items={barrett.map(s=>s.material.name)} note="Best-case inheritance assumes rerolling until Barrett reports these items."/>
    <PlanSection title="5. Upgrade sequence" items={plan.upgrades.map(s=>s.material.name)} note="Order is significant; Steel, Object X, repeat decay, Cores, and special restrictions are included."/>
    <div className="optimizer-totals"><div><span>Level total</span><strong>{plan.result.totalLevel}/150</strong></div><div><span>Rarity total</span><strong>{plan.result.totalRarity}/225</strong></div><div><span>Element</span><strong>{plan.result.element}</strong></div></div>
    {plan.result.specialEffects.length>0&&<div className="special-effects"><strong>Active special effects</strong><ul>{plan.result.specialEffects.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
    {plan.result.warnings.length>0&&<div className="rule-warnings"><strong>Plan warnings</strong><ul>{plan.result.warnings.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
    <ResultGroup title="Core stats" keys={["str","vit","int","crit","range"]} effects={plan.result.effects}/>
    <ResultGroup title="Elemental resistance" keys={["fireRes","waterRes","earthRes","windRes","lightRes","darkRes","loveRes","noRes"]} effects={plan.result.effects}/>
    <p className="optimizer-target-summary">{maximizing?"Maximization uses final effective values, so STR contributes to ATK, INT to M.ATK, and VIT contributes 0.5 each to DEF and M.DEF.":`Validated against ${Object.values(targets).filter(v=>(v||0)>0).length} numeric target(s), including STR/INT/VIT conversion and level/rarity bonuses.`}</p>
  </div>;
}

function PlanSection({title,items,note}:{title:string;items:string[];note:string}) {
  return <div className="plan-section"><div><h3>{title}</h3><small>{note}</small></div>{items.length?<ol>{items.map((item,i)=><li key={`${item}-${i}`}>{item}</li>)}</ol>:<p>None</p>}</div>;
}

function MaterialEditor({slot,onClose,onSave}:{slot:Slot;onClose:()=>void;onSave:(m:Material)=>void}) {
  const [m,setM]=useState<Material>({...slot.material,effects:{...slot.material.effects}});
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal editor" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">MATERIAL DETAILS</span><h2>Edit contribution</h2><p className="modal-help">Saved custom materials stay in this browser and become available in matching recipe categories.</p></div><button className="icon-button" onClick={onClose}>×</button></div><div className="editor-basics"><label><span>Name</span><input value={m.name} onChange={e=>setM({...m,name:e.target.value})}/></label><label><span>Category</span><select value={m.category || "Misc."} onChange={e=>setM({...m,category:e.target.value as MaterialCategory})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label><label><span>Level</span><input type="number" min="1" max="10" value={m.level} onChange={e=>setM({...m,level:clamp(Number(e.target.value),1,10)})}/></label><label><span>Rarity</span><input type="number" min="0" max="15" value={m.rarity} onChange={e=>setM({...m,rarity:clamp(Number(e.target.value),0,15)})}/></label><label><span>Upgrade difficulty</span><input type="number" min="0" max="99" value={m.difficulty ?? 0} placeholder="0" onChange={e=>setM({...m,difficulty:e.target.value === "" ? 0 : clamp(Number(e.target.value),0,99)})}/></label></div><h3>Printed upgrade effects</h3><div className="effect-editor">{KEYS.map(k=><label key={k.key}><span>{k.label}{k.unit}</span><input type="number" step="0.01" value={m.effects[k.key] || ""} placeholder="0" onChange={e=>setM({...m,effects:{...m.effects,[k.key]:Number(e.target.value)}})}/></label>)}</div><div className="editor-actions"><button className="quiet" onClick={onClose}>Cancel</button><button className="primary" disabled={!m.name.trim()} onClick={()=>onSave(m)}>Save material</button></div></div></div>
}
