// RF4-only acquisition references transcribed from the Monsters (RF4) and Crops (RF4) tables.
// Items not present in either supplied table deliberately return no source instead of a guess.

const cropNames = new Set([
  "Turnip","Potato","Spinach","Radish","Cucumber","Yam","Pumpkin","Pink Turnip","Strawberry","Corn","Carrot","Green Pepper","Eggplant","Leek","Hot-Hot Fruit","Bok Choy","Cabbage","Onion","Tomato","Pink Melon","Pineapple","Golden Potato","Golden Pumpkin","Golden Cabbage","Golden Turnip",
]);

const giantCropNames = new Set([
  "Tyrant Turnip","Princely Potato","Sovereign Spinach","Noble Radish","Kaiser Cucumber","Lordly Yam","Doom Pumpkin","Colossal Pink","Sultan Strawberry","Gigant Corn","Royal Carrot","Green Pepper Rex","Emperor Eggplant","Legendary Leek","Giant Hot-Hot Fruit","Boss Bok Choy","King Cabbage","Ultra Onion","Titan Tomato","Conqueror Melon","King Pineapple","Gold Prince Potato","Golden Doom Pumpkin","Golden King Cabbage","Golden Tyrant Turnip",
]);

const flowerNames = new Set([
  "Toyherb","Moondrop","Pink Cat","Charm Blue","Cherry Grass","Pom-Pom Grass","Lamp Grass","Ironleaf","4-Leaf Clover","Autumn Grass","Noel Grass","Fireflower","Blue Crystal","Green Crystal","Red Crystal","White Crystal","Emery Flower",
]);

const giantFlowerNames = new Set([
  "Ultra Toyherb","Ultra Moondrop Flower","King Pink Cat","Great Charm Blue","King Cherry Grass","King Pom-Pom Grass","Kaiser Lamp Grass","Super Ironleaf","Great 4-Leaf Clover","Giant 4-Leaf Clover","Big Autumn Grass","Large Noel Grass","Big Fireflower","Big Blue Crystal","Big Green Crystal","Big Red Crystal","Big White Crystal","Great Emery Flower",
]);

const fruitNames = new Set(["Grapes","Apple","Orange","Strawberry","Pineapple","Sultan Strawberry","King Pineapple"]);
const treeFruitNames = new Set(["Grapes","Apple","Orange"]);

export const DATABASE_INGREDIENT_CATEGORIES = ["Crops","Giant Crops","Flowers","Giant Flowers","Fruits"] as const;

const MONSTER_LOCATION_ORDER: Array<{
  label:string;
  matches:(location:string)=>boolean;
}> = [
  {label:"Selphia Plain",matches:location=>location.startsWith("Selphia Plain")},
  {label:"Yokmir Forest",matches:location=>location.startsWith("Yokmir Forest")},
  {label:"Mush Road",matches:location=>location.startsWith("Mush Road")},
  {label:"Cluck-Cluck Nest",matches:location=>location.startsWith("Cluck-Cluck Nest")},
  {label:"Water Ruins",matches:location=>location.startsWith("Water Ruins")},
  {label:"Obsidian Mansion",matches:location=>location.startsWith("Obsidian Mansion")},
  {label:"Yokmir Cave",matches:location=>location.startsWith("Yokmir Cave")},
  {label:"Delirium Lava Ruins",matches:location=>location.startsWith("Delirium Lava Ruins")},
  {label:"Sercerezo Hill",matches:location=>location.startsWith("Sercerezo Hill")},
  {label:"Demon's Den",matches:location=>location.startsWith("Demon's Den")},
  {label:"Idra Cave",matches:location=>location.startsWith("Idra Cave")},
  {label:"Autumn Road",matches:location=>location.startsWith("Autumn Road")},
  {label:"Maya Road",matches:location=>location.startsWith("Maya Road")},
  {label:"Revival Cave",matches:location=>location.startsWith("Revival Cave")},
  {label:"Sechs Territory",matches:location=>location.startsWith("Sechs Territory")},
  {label:"Floating Empire",matches:location=>location === "Floating Empire"},
  {label:"Floating Empire West",matches:location=>location.startsWith("Floating Empire West")},
  {label:"Floating Empire East",matches:location=>location.startsWith("Floating Empire East")},
  {label:"Floating Empire South",matches:location=>location.startsWith("Floating Empire South")},
  {label:"Leon Karnak",matches:location=>location.startsWith("Leon Karnak")},
  {label:"Field Dungeon",matches:location=>location.startsWith("Field Dungeon")},
  {label:"Rune Prana",matches:location=>location.startsWith("Rune Prana")},
  {label:"Sharance Maze",matches:location=>location === "Sharance Maze"},
  {label:"Sharance Maze: Garden of Light",matches:location=>location.startsWith("Sharance Maze: Garden of Light")},
  {label:"Sharance Maze: Smoldering Prominence",matches:location=>location.startsWith("Sharance Maze: Smoldering Prominence")},
  {label:"Sharance Maze: Deepwater Shrine",matches:location=>location.startsWith("Sharance Maze: Deepwater Shrine")},
  {label:"Sharance Maze: Dragon Ruins",matches:location=>location.startsWith("Sharance Maze: Dragon Ruins")},
];

function firstListedLocation(locationText:string):string {
  return locationText.split(/,\s*(?:and\s+)?|\s+and\s+|\s*\/\s*/)[0].trim();
}

function locationRank(location:string):number | undefined {
  const rank=MONSTER_LOCATION_ORDER.findIndex(item=>item.matches(location));
  return rank<0?undefined:rank;
}

function monsterLocationRank(entry:string):number | undefined {
  const open=entry.lastIndexOf("(");
  const close=entry.lastIndexOf(")");
  if(open<0||close<open)return undefined;
  const firstLocation=firstListedLocation(entry.slice(open+1,close));
  return locationRank(firstLocation);
}

function monsterEntryName(entry:string):string {
  const open=entry.lastIndexOf("(");
  return entry.slice(0,open<0?entry.length:open).trim();
}

function sortLocationsWithinEntry(entry:string):string {
  const open=entry.lastIndexOf("(");
  const close=entry.lastIndexOf(")");
  if(open<0||close<open)return entry;
  const originalLocationText=entry.slice(open+1,close);
  const locations=originalLocationText.split(/,\s*(?:and\s+)?|\s+and\s+|\s*\/\s*/).map(location=>location.trim());
  if(locations.length<2)return entry;
  const ranked=locations.map((location,index)=>({location,index,rank:locationRank(location)}));
  const recognized=ranked.filter(location=>location.rank!==undefined).sort((a,b)=>a.rank!-b.rank!||a.index-b.index);
  if(recognized.length<2)return entry;
  let recognizedIndex=0;
  const ordered=ranked.map(location=>location.rank===undefined?location.location:recognized[recognizedIndex++].location);
  const locationText=ordered.length===2
    ? ordered.join(originalLocationText.includes(" and ")?" and ":", ")
    : `${ordered.slice(0,-1).join(", ")}, and ${ordered.at(-1)}`;
  return `${entry.slice(0,open+1)}${locationText}${entry.slice(close)}`;
}

function sortMonsterDropSegment(segment:string):string {
  const marker=" — ";
  const markerIndex=segment.indexOf(marker);
  if(markerIndex<0||!/^Monster drop(?:\/produce)?$/.test(segment.slice(0,markerIndex)))return segment;
  const label=segment.slice(0,markerIndex);
  const body=segment.slice(markerIndex+marker.length);

  const entries:string[]=[];
  const delimiters:string[]=[];
  let cursor=0;
  let depth=0;
  for(let index=0;index<body.length;index++){
    if(body[index]==="(")depth++;
    else if(body[index]===")"){
      depth--;
    }
    if(depth!==0)continue;
    const delimiter=body.slice(index).match(/^(;\s*(?:or\s+)?|,\s*(?:or\s+)?|\s+or\s+)/)?.[0];
    if(!delimiter)continue;
    const currentEntry=body.slice(cursor,index).trim();
    if(delimiter.startsWith(",")&&!currentEntry.endsWith(")"))continue;
    if(delimiter.trimStart().startsWith("or ")&&!currentEntry.endsWith(")"))continue;
    entries.push(currentEntry);
    delimiters.push(delimiter);
    cursor=index+delimiter.length;
    index=cursor-1;
  }
  entries.push(body.slice(cursor).trim());

  if(entries.length<2)return `${label}${marker}${sortLocationsWithinEntry(entries[0]??body)}`;

  const ordered=entries.map((rawEntry,index)=>{
    const entry=sortLocationsWithinEntry(rawEntry);
    return {
      entry,
      index,
      general:entry.indexOf("(")<0,
      name:monsterEntryName(entry),
      rank:monsterLocationRank(entry),
    };
  }).sort((a,b)=>{
    if(a.general!==b.general)return a.general?-1:1;
    if(a.rank===undefined&&b.rank===undefined)return a.index-b.index;
    if(a.rank===undefined)return 1;
    if(b.rank===undefined)return -1;
    return a.rank-b.rank||a.name.localeCompare(b.name);
  });

  const sortedBody=ordered.map((item,index)=>`${index?delimiters[index-1]:""}${item.entry}`).join("");
  return `${label}${marker}${sortedBody}`;
}

export function sortMonsterDropSource(source:string):string {
  return source.split(" · ").map(sortMonsterDropSegment).join(" · ");
}

export function getMaterialDatabaseCategories(name:string, fallback?:string): string[] {
  const result:string[] = [];
  if (cropNames.has(name)) result.push("Crops");
  if (giantCropNames.has(name)) result.push("Giant Crops");
  if (flowerNames.has(name)) result.push("Flowers");
  if (giantFlowerNames.has(name)) result.push("Giant Flowers");
  if (fruitNames.has(name)) result.push("Fruits");
  return result.length ? result : fallback ? [fallback] : [];
}

const wildSources: Record<string,string> = {
  "Withered Grass":"Wild plant — found throughout RF4 field areas",
  "Weeds":"Wild plant — found throughout RF4 field areas",
  "Medicinal Herb":"Wild plant — Selphia Plain and seasonal fields",
  "Antidote Grass":"Wild plant — Selphia Plain and seasonal fields",
  "Green Grass":"Wild plant — Selphia Plain and Green Ruins",
  "Blue Grass":"Wild plant — Water Ruins and Maya Road",
  "Purple Grass":"Wild plant — Obsidian Mansion and Maya Road",
  "Black Grass":"Wild plant — Obsidian Mansion and Leon Karnak",
  "Indigo Grass":"Wild plant — Maya Road and Sechs Territory",
  "Yellow Grass":"Wild plant — Autumn Road and Delirium Lava Ruins",
  "Red Grass":"Wild plant — Delirium Lava Ruins and Sechs Territory",
  "Orange Grass":"Wild plant — Autumn Road and Sercerezo Hill",
  "White Grass":"Wild plant — Sechs Territory and Rune Prana",
  "Mealy Apple":"Monster drop — Typhoon (appears at Sercerezo Hill only during typhoon days)",
  "Glitta Augite":"Farming — may be obtained while chopping a grown Twinkle Tree; Twinkle Seed can be bought at Sincerity General Store",
  "Material Stone":"Field work — produced by striking a Rock with a hammer",
  "Elli Leaves":"Field pickup — Floating Continent, Leon Karnak, and Rune Prana",
};

const monsterSources: Record<string,string> = {
  "Insect Carapace":"Monster drop — Ant Queen (Rune Prana Floor 4), Ant (Yokmir Forest and Yokmir Cave), Beetle (Yokmir Forest and Selphia Plain), Death Stalker (Sechs Territory), Heaven's Scissors (Rune Prana Floor 5), Heracles (Maya Road), Hornet (Yokmir Cave), Killer Ant (Yokmir Cave), King Bee (Rune Prana Floor 2), or Scorpion (Delirium Lava Ruins) · Monster produce — Ant",
  "Insect Jaw":"Monster drop — Ant (Yokmir Forest and Yokmir Cave), Hell Spider (Floating Empire), Hornet Queen (Maya Road), Hornet (Yokmir Cave), Killer Ant (Yokmir Cave), or Spider (Obsidian Mansion)",
  "Insect Horn":"Monster drop — Beetle (Yokmir Forest and Selphia Plain) · Monster produce — Beetle",
  "Pretty Carapace":"Monster drop — Ant Queen (Rune Prana Floor 4), Ant (Yokmir Forest and Yokmir Cave), Beetle (Yokmir Forest and Selphia Plain), Death Stalker (Sechs Territory), Heaven's Scissors (Rune Prana Floor 5), Heracles (Maya Road), Hornet Queen (Maya Road), Hornet (Yokmir Cave), Killer Ant (Yokmir Cave), King Bee (Rune Prana Floor 2), or Scorpion (Delirium Lava Ruins) · Monster produce — Killer Ant",
  "Bird's Feather":"Monster drop — Cluckadoodle (Selphia Plain and Cluck-Cluck Nest), Duck (Selphia Plain), Emperor Penguin (Sechs Territory), Mamadoodle (Cluck-Cluck Nest), or Weagle (Selphia Plain and Water Ruins) · Monster produce — Weagle",
  "Yellow Feather":"Monster drop — Duck (Selphia Plain) or Big Duck (Rune Prana Floor 2)",
  "Black Bird Feather":"Monster drop — Blackbird (Maya Road, Rune Prana) · Monster produce — Blackbird",
  "Thunderbird Feather":"Monster drop — Thunderbird (Floating Empire) · Monster produce — Thunderbird",
  "Dragon Fin":"Monster drop — Aquaticus (Sharance Maze: Deepwater Shrine Lv. 10)",
  "Turtle Shell":"Monster drop — Tortas (Selphia Plain and Water Ruins)",
  "Fish Fossil":"Monster drop — Ancient Bone (Revival Cave and Sharance Maze: Deepwater Shrine Lv. 4), Octopirate (Field Dungeon, Rune Prana Floor 2, and Sharance Maze: Smoldering Prominence Lv. 4), Sealy (Sechs Territory), or Sky Fish (Water Ruins and Selphia Plain)",
  "Skull":"Monster drop — Ancient Bone (Revival Cave and Sharance Maze: Deepwater Shrine Lv. 4), Captain Goblin (Leon Karnak), Faust (Floating Empire), Gangster Goblin (Delirium Lava Ruins), Ghost Ray (Obsidian Mansion), Ghost (Obsidian Mansion), Goblin Don (Leon Karnak), Goblin Pirate (Delirium Lava Ruins), or Necro (Idra Cave)",
  "Dragon Bones":"Monster drop — Ancient Bone (Revival Cave and Sharance Maze: Deepwater Shrine Lv. 4)",
  "Blk. Tortoise Shell":"Monster drop — Fortoise (Floating Empire)",
  "Black Tortoise Shell":"Monster drop — Fortoise (Floating Empire)",
  "Ammonite":"Monster drop — Octopirate (Field Dungeon, Rune Prana Floor 2, and Sharance Maze: Smoldering Prominence Lv. 4)",
  "Yarn":"Crafting — crafted material",
  "Old Bandage":"Monster drop — Gangster Goblin (Delirium Lava Ruins), Goblin Archer (Water Ruins), Goblin Don (Leon Karnak), or Goblin (Water Ruins)",
  "Ambrosia's Thorns":"Monster drop — Ambrosia (Yokmir Forest and Sharance Maze: Dragon Ruins Lv. 2)",
  "Spider's Thread":"Monster drop — Hell Spider (Floating Empire) or Spider (Obsidian Mansion) · Monster produce — Spider",
  "Puppetry Strings":"Monster drop — Marionetta (Obsidian Mansion and Sharance Maze: Dragon Ruins Lv. 6)",
  "Scorpion Tail":"Monster drop — Death Stalker (Sechs Territory), Heaven's Scissors (Rune Prana Floor 5), or Scorpion (Delirium Lava Ruins) · Monster produce — Death Stalker or Scorpion",
  "Chimera Tail":"Monster drop — Chimera (Water Ruins, Rune Prana Floor 7, and Sharance Maze: Garden of Light Lv. 4)",
  "Broken Hilt":"Monster drop — Monster Box (rare encounter anywhere in any dungeon) or Gobble Box (rare encounter anywhere in any dungeon)",
  "Broken Box":"Monster drop — Monster Box (rare encounter anywhere in any dungeon) or Gobble Box (rare encounter anywhere in any dungeon)",
  "Hammer Piece":"Monster drop — Gigantes (Floating Empire), Hammer Troll (Maya Road), Master Giant (Floating Empire), Master Troll (Rune Prana Floor 4), Minotaur King (Leon Karnak), or Minotaur (Idra Cave)",
  "Shoulder Piece":"Monster drop — Ogre Viking (Sechs Territory) or Orc Viking (Sechs Territory)",
  "Rusty Screw":"Monster drop — Gasham (Floating Empire) or Sechs Tank (Floating Empire East)",
  "Shiny Screw":"Monster drop — Gasham (Floating Empire) or Sechs Tank (Floating Empire East)",
  "Glistening Blade":"Monster drop — Faust (Floating Empire)",
  "Great Hammer Shard":"Monster drop — Baal (Rune Prana Floor 5) or Master Giant (Floating Empire)",
  "Pirate's Armor":"Monster drop — High Ogre Viking (Rune Prana Floor 3) or High Orc Viking (Rune Prana Floor 3)",
  "Left Rock Shard":"Monster drop — Sano (Leon Karnak)",
  "Right Rock Shard":"Monster drop — Uno (Leon Karnak)",
  "MTGU Plate":"Monster drop — Armored Tank+ (Floating Empire South)",
  "Broken Ice Wall":"Monster drop — Death Wall (Rune Prana Floor 6 and Sharance Maze: Deepwater Shrine Lv. 8)",
  "Fur (S)":"Monster drop — all wooly-family monsters · Monster produce — Wooly",
  "Fur (M)":"Monster drop — King Wooly (Yokmir Cave and Autumn Road) or Shmooly (Selphia Plain) · Monster produce — Wooly at Lv. 51+",
  "Fur (L)":"Monster produce — Wooly at Lv. 101+",
  "Fur":"Monster drop — all beast-like boss monsters including Greater Demon, Hinoe, Kinoto and Thunderbolt; Blood Panther (Floating Empire); Hunter Wolf (Sechs Territory); Leoplicant (Rune Prana Floors 4 and 7); Malm Tiger (Leon Karnak); Palm Cat (Autumn Road and Delirium Lava Ruins); Shadow Panther (Obsidian Mansion); Silver Wolf (Yokmir Cave and Sechs Territory); or Chipsqueek (Selphia Plain) · Monster produce — Chipsqueek",
  "Yellow Down":"Monster drop — Duck (Selphia Plain) or Big Duck (Rune Prana Floor 2)",
  "Quality Fur":"Monster drop — all beast-like boss monsters including Chimera, Crystal Mammoth, Greater Demon, Hinoe, Kinoto and Thunderbolt; Hunter Wolf (Sechs Territory); Leoplicant (Rune Prana Floors 4 and 7); Malm Tiger (Leon Karnak); Shadow Panther (Obsidian Mansion); Silver Wolf (Yokmir Cave and Sechs Territory); or Chipsqueek (Selphia Plain)",
  "Lightning Mane":"Monster drop — Thunderbolt (Water Ruins and Sharance Maze: Dragon Ruins Lv. 4)",
  "Quality Puffy Fur":"Monster drop — Furpy (Autumn Road) · Monster produce — Furpy",
  "Wooly Furball":"Monster drop — King Wooly (Yokmir Cave and Autumn Road) or Shmooly (Selphia Plain)",
  "Penguin Down":"Monster drop — Emperor Penguin (Sechs Territory)",
  "Red Lion Fur":"Monster drop — Hinoe (Rune Prana Floor 4 and Sharance Maze: Deepwater Shrine Lv. 6)",
  "Blue Lion Fur":"Monster drop — Kinoto (Rune Prana Floor 4 and Sharance Maze: Deepwater Shrine Lv. 6)",
  "Chest Hair":"Monster drop — Greater Demon (Field Dungeon, Rune Prana Floor 7, and Sharance Maze: Garden of Light Lv. 2)",
  "Spore":"Monster drop — Big Muck (Selphia Plain), Death Fungus (Mush Road), or Tricky Muck (Autumn Road) · Monster produce — Big Muck or Death Fungus",
  "Fairy Dust":"Monster drop — Fairy (Selphia Plain) or Dark Fairy (Floating Empire) · Monster produce — Fairy",
  "Gunpowder":"Monster drop — Goblin Sniper (Idra Cave), Orc Archer (Yokmir Forest), or Orc Hunter (Yokmir Cave)",
  "Poison Powder":"Monster drop — Big Muck (Selphia Plain), Death Fungus (Mush Road), or Tricky Muck (Autumn Road) · Monster produce — Tricky Muck",
  "Holy Spore":"Monster drop — Death Fungus (Mush Road, Fridays only)",
  "Root":"Monster drop — Flower Blossom (Sercerezo Hill), Flower Crystal (Sechs Territory), Flower Lily (Autumn Road), Flower Lion (Delirium Lava Ruins), Leaf Ball (Yokmir Cave), or Planchoa (Maya Road) · Monster produce — Flower Blossom or Planchoa",
  "Magic Powder":"Monster drop — Little Mage (Idra Cave)",
  "Mysterious Powder":"Monster drop — ??? (Maya Road)",
  "Magic":"Monster drop — Elemental Emperor (Rune Prana Floor 6), Flare Mage (Rune Prana Floors 1 and 7), Ice Wizard (Rune Prana Floors 5 and 7), Little Emperor (Leon Karnak), or Little Wizard (Sechs Territory)",
  "Fairy Elixir":"Monster drop — Dark Fairy (Floating Empire) · Monster produce — Dark Fairy",
  "Earth Dragon Ash":"Monster drop — Terraclone (Idra Cave)",
  "Fire Dragon Ash":"Monster drop — Fiergaenger (Maya Road)",
  "Water Dragon Ash":"Monster drop — Aquameleon (Sechs Territory)",
  "Turnip's Miracle":"Monster drop — Turnip Ghost (Rune Prana Floors 3 and 7)",
  "Melody Bottle":"Monster drop — Siren (Rune Prana Floor 5)",
  "Cheap Cloth":"Monster drop — High Orc (Yokmir Cave), Orc (Yokmir Forest), or Rider Orc (Yokmir Cave)",
  "Ghost Hood":"Monster drop — Faust (Floating Empire), Ghost Ray (Obsidian Mansion), Ghost (Obsidian Mansion), Necro (Idra Cave), Onion Ghost (Selphia Plain), Onionger (Rune Prana Floor 1), Pepper Ghost (Floating Empire), or Tomato Ghost (Delirium Lava Ruins)",
  "Quality Cloth":"Monster drop — Gangster Goblin (Delirium Lava Ruins) or Goblin Pirate (Delirium Lava Ruins)",
  "Quality Worn Cloth":"Monster drop — Onionger (Rune Prana Floor 1)",
  "Silk Cloth":"Monster drop — Captain Goblin (Leon Karnak), Goblin Pirate (Delirium Lava Ruins), Goblin Sniper (Idra Cave), or Hobgoblin (Idra Cave)",
  "Giant's Gloves":"Monster drop — Gigantes (Floating Empire), Hammer Troll (Maya Road), Master Giant (Floating Empire), Master Troll (Rune Prana Floor 4), Titan (Sechs Territory and Rune Prana Floor 7), or Troll (Delirium Lava Ruins)",
  "Blue Giant's Glove":"Monster drop — Titan (Sechs Territory and Rune Prana Floor 7)",
  "Ancient Orc Cloth":"Monster drop — Death Orc (Rune Prana Floor 7)",
  "Panther Claw":"Monster drop — Shadow Panther (Obsidian Mansion)",
  "Wolf Fang":"Monster drop — Silver Wolf (Yokmir Cave and Sechs Territory) or Hunter Wolf (Sechs Territory) · Monster produce — Silver Wolf",
  "Palm Claw":"Monster drop — Leoplicant (Rune Prana Floors 4 and 7) or Palm Cat (Autumn Road and Delirium Lava Ruins)",
  "Giant's Nail":"Monster drop — Gigantes (Floating Empire), Hammer Troll (Maya Road), Master Giant (Floating Empire), Titan (Sechs Territory and Rune Prana Floor 7), or Troll (Delirium Lava Ruins)",
  "Chimera's Claw":"Monster drop — Chimera (Water Ruins, Rune Prana Floor 7, and Sharance Maze: Garden of Light Lv. 4)",
  "Ivory Tusk":"Monster drop — Elefun (Spring Area, Idra Cave, and Sercerezo Hill) or Mammoo (Sechs Territory)",
  "Big Giant's Nail":"Monster drop — Master Troll (Rune Prana Floor 4)",
  "Unbroken Ivory Tusk":"Monster drop — Mammoo (Sechs Territory)",
  "Gold Wolf Fang":"Monster drop — Hunter Wolf (Sechs Territory) · Monster produce — Hunter Wolf",
  "Scorpion Pincer":"Monster drop — Death Stalker (Sechs Territory)",
  "Cheap Propeller":"Monster drop — Hover Soldier (Floating Empire) or Hover Warrior (Floating Empire)",
  "Quality Propeller":"Monster drop — Hover Soldier (Floating Empire) or Hover Warrior (Floating Empire)",
  "Magic Claw":"Monster drop — Blood Panther (Floating Empire)",
  "Dragon Fang":"Monster drop — all dragon-family monsters, Little Dragon (Sechs Empire), plus dragon bosses including Fiersome, Terrable, Aquaticus, and Ventuswill",
  "Malm Claw":"Monster drop — Leoplicant (Rune Prana Floors 4 and 7) or Malm Tiger (Leon Karnak)",
  "Queen's Jaw":"Monster drop — Ant Queen (Rune Prana Floor 4) · Monster produce — Ant Queen",
  "Dangerous Scissors":"Monster drop — Heaven's Scissors (Rune Prana Floor 5) · Monster produce — Heaven's Scissors",
  "Wind Dragon Tooth":"Monster drop — Ventuswill (Sharance Maze: Dragon Ruins Lv. 12)",
  "Wet Scale":"Monster drop — Sealy (Sechs Territory)",
  "Dragon Scale":"Monster drop — Green Dragon (Rune Prana Floor 1) or Ventuswill (Sharance Maze: Dragon Ruins Lv. 12)",
  "Crimson Scale":"Monster drop — Red Dragon (Rune Prana Floor 4)",
  "Blue Scale":"Monster drop — Blue Dragon (Rune Prana Floors 6 and 7)",
  "Glitter Scale":"Monster drop — Yellow Dragon (Rune Prana Floors 6 and 7)",
  "Love Scale":"Monster drop — Pink Dragon (Rune Prana Floors 6 and 7)",
  "Black Scale":"Monster drop — Black Dragon (Rune Prana Floor 7)",
  "Grimoire Scale":"Monster drop — Grimoire (Field Dungeon, Leon Karnak, and Sharance Maze: Garden of Light Lv. 6)",
  "Firewyrm Scale":"Monster drop — Fiersome (Sharance Maze: Smoldering Prominence Lv. 10)",
  "Earthwyrm Scale":"Monster drop — Terrable (Sharance Maze: Garden of Light Lv. 10)",
  "Legendary Scale":"Monster drop — Aquaticus (Sharance Maze: Deepwater Shrine Lv. 10) · Fishing — very rare catch",
  "Double Steel":"Monster drop — Mineral Squeek (Leon Karnak)",
  "10-Fold Steel":"Monster drop — Mineral Squeek (Leon Karnak)",
  "Raccoon Leaf":"Monster drop — Magnuto (Demon's Den and Sharance Maze: Deepwater Shrine Lv. 2)",
  "Icy Nose":"Monster drop — Crystal Mammoth (Sechs Territory, Rune Prana Floor 3, and Sharance Maze: Smoldering Prominence Lv. 8)",
  "Big Bird's Comb":"Monster drop — Mamadoodle (Cluck-Cluck Nest)",
  "Rafflesia Petal":"Monster drop — Rafflesia (Delirium Lava Ruins)",
  "Cursed Doll":"Monster drop — Marionetta (Obsidian Mansion and Sharance Maze: Dragon Ruins Lv. 6)",
  "Warrior's Proof":"Monster drop — Captain Goblin (Leon Karnak)",
  "Proof of Rank":"Monster drop — Goblin Don (Leon Karnak)",
  "Throne of the Empire":"Monster drop — Ragnarok (Rune Prana Floor 7)",
  "Green Core":"Monster drop — Emerald (Rune Prana Floor 7) or Green (Maya Road)",
  "Red Core":"Monster drop — Red (Autumn Road) or Rouge (Rune Prana Floor 7)",
  "Yellow Core":"Monster drop — Olive (Rune Prana Floor 7) or Yellow (Sercerezo Hill)",
  "Blue Core":"Monster drop — Blue (Sechs Territory) or Marin (Rune Prana Floor 7)",
  "Magic Crystal":"Monster drop — Airror (Maya Road), Elemental Emperor (Rune Prana Floor 6), Flare Mage (Rune Prana Floors 1 and 7), Gaias (Idra Cave), Ice Wizard (Rune Prana Floors 5 and 7), Ignis (Delirium Lava Ruins), Little Emperor (Leon Karnak), Little Mage (Idra Cave), Little Wizard (Sechs Territory), Sarcophagus (Leon Karnak), Spirit (Obsidian Mansion), or Tundra (Sechs Territory)",
  "Dark Crystal":"Monster drop — Spirit (Obsidian Mansion) or Dark Slime (Floating Empire West) · Gate drop — rare drop from dark-elemental Gates",
  "Love Crystal":"Gate drop — rare drop from love-elemental Gates",
  "Light Crystal":"Gate drop — rare drop from light-elemental Gates",
  "Electro Crystal":"Monster drop — Bane Dragon (Rune Prana Floor 1 and Sharance Maze: Smoldering Prominence Lv. 6)",
  "Branch":"Monster drop — Blackbird (Maya Road and Rune Prana), Chipsqueek (Selphia Plain), Furpy (Autumn Road), Thunderbird (Floating Empire), or Weagle (Selphia Plain and Water Ruins) · Field pickup — found randomly on any untilled soil in dungeons, the overworld, or farms",
  "Lumber":"Field work — produced by chopping a Branch with an axe",
  "Stick":"Monster drop — Blackbird (Maya Road and Rune Prana), Chipsqueek (Selphia Plain), Furpy (Autumn Road), Ghost Ray (Obsidian Mansion), Ghost (Obsidian Mansion), High Orc (Yokmir Cave), Orc Archer (Yokmir Forest), Orc Hunter (Yokmir Cave), or Orc (Yokmir Cave)",
  "Plant Stem":"Monster drop — Flower Blossom (Sercerezo Hill), Flower Crystal (Sechs Territory), Flower Lily (Autumn Road), Flower Lion (Delirium Lava Ruins), Leaf Ball (Yokmir Cave), Planchoa (Maya Road), or Rafflesia (Delirium Lava Ruins) · Monster produce — Flower Lion or Leaf Ball",
  "Bull's Horn":"Monster drop — Buffaloo (Delirium Lava Ruins) · Monster produce — Buffaloo",
  "Rigid Horn":"Monster drop — Heracles (Maya Road) · Monster produce — Heracles",
  "Thick Stick":"Monster drop — Ghost Ray (Obsidian Mansion) or Gigantes (Floating Empire)",
  "Devil Horn":"Monster drop — Daemon (Idra Cave), Minotaur King (Leon Karnak), Minotaur (Idra Cave), Arch-Daemon (Leon Karnak), Baal (Rune Prana Floor 5), or Typhoon (Sercerezo Hill)",
  "Moving Branch":"Monster drop — Dead Tree (Rune Prana Floor 7 and Sharance Maze: Smoldering Prominence Lv. 2)",
  "Glue":"Monster drop — Goblin (Water Ruins), High Ogre Viking (Rune Prana Floor 3), High Orc Viking (Rune Prana Floor 3), High Orc (Yokmir Cave), Hobgoblin (Idra Cave), Ogre Viking (Sechs Territory), Orc Viking (Sechs Territory), Orc (Yokmir Forest), or Rider Orc (Yokmir Cave)",
  "Devil Blood":"Monster drop — Blood Panther (Floating Empire), Daemon (Idra Cave), Arch-Daemon (Leon Karnak), Baal (Rune Prana Floor 5), or Typhoon (Sercerezo Hill)",
  "Paralysis Poison":"Monster drop — Hornet Queen (Maya Road)",
  "Poison King":"Monster drop — King Bee (Rune Prana Floor 2)",
  "Rock":"Field pickup — found randomly on any untilled soil in dungeons, the overworld, or farms",
  "Tiny Golem Stone":"Monster drop — Little Golem (Idra Cave)",
  "Golem Stone":"Monster drop — Golem (Floating Empire)",
  "Golem Tablet":"Monster drop — Sechs Golem (Floating Empire West) or G Golem (Rune Prana Floor 7 and Sharance Maze: Garden of Light Lv. 8)",
  "Tablet of Truth":"Monster drop — G Golem (Rune Prana Floor 7 and Sharance Maze: Garden of Light Lv. 8)",
  "Vine":"Monster drop — Flower Blossom (Sercerezo Hill), Flower Lily (Autumn Road), Flower Lion (Delirium Lava Ruins), or Leaf Ball (Yokmir Cave) · Monster produce — Flower Lily",
  "Strong Vine":"Monster drop — Planchoa (Maya Road), Flower Blossom (Sercerezo Hill), Flower Crystal (Sechs Territory), or Flower Lion (Delirium Lava Ruins) · Monster produce — Flower Crystal",
  "Pretty Thread":"Monster drop — Hell Spider (Floating Empire) or Spider (Obsidian Mansion) · Monster produce — Hell Spider",
  "Arrowhead":"Monster drop — Orc Archer (Yokmir Forest), Orc Hunter (Yokmir Cave), Goblin Archer (Water Ruins), or Goblin Sniper (Idra Cave)",
  "Blade Shard":"Monster drop — Goblin (Water Ruins), Hobgoblin (Idra Cave), or Rider Orc (Yokmir Cave)",
  "Crystal Skull":"Monster drop — Sarcophagus (Leon Karnak and Sharance Maze: Dragon Ruins Lv. 10)",
  "Rune Crystal":"Monster drop — Emerald (Rune Prana Floor 7), Marin (Rune Prana Floor 7), Olive (Rune Prana Floor 7), Rouge (Rune Prana Floor 7), or Ragnarok (Rune Prana Floor 7 and Sharance Maze)",
  "Rune Sphere Shard":"Monster drop — Ragnarok (Rune Prana Floor 7)",
  "Rare Can":"Monster drop — Sealy (Sechs Territory) · Fishing — rare catch",
  "Orange":"Monster drop — Snowy (Sechs Territory)",
  "Grapes":"Monster drop — Mino (Autumn Road)",
  "Apple":"Monster drop — Pomme Pomme (Selphia Plain) or Dead Tree (Yokmir Forest, Rune Prana Floor 7, and Sharance Maze: Smoldering Prominence Lv. 2)",
  "Pineapple":"Monster drop — Nappie (Leon Karnak)",
  "Iron":"Monster drop — Hover Soldier (Floating Empire), Hover Warrior (Floating Empire), or Tortas (Selphia Plain and Water Ruins) · Mining — common secondary result from ore and gemstone nodes",
  "Bronze":"Monster drop — Slime (Obsidian Mansion) or Tortas (Water Ruins and Selphia Plain) · Mining — Bronze ore nodes in Obsidian Mansion",
  "Silver":"Monster drop — Fortoise (Floating Empire), Golem (Floating Empire), or Little Golem (Idra Cave) · Mining — Silver ore nodes in Delirium Lava Ruins, Maya Road, and Autumn Road",
  "Gold":"Monster drop — Armored Tank+ (Floating Empire South), Fortoise (Floating Empire), Golem (Floating Empire), Hover Soldier (Floating Empire), or Hover Warrior (Floating Empire) · Mining — Gold ore nodes in Idra Cave and Maya Road",
  "Platinum":"Monster drop — Armored Tank+ (Floating Empire South), G Golem (Rune Prana Floor 7 and Sharance Maze: Garden of Light Lv. 8), Sechs Golem (Floating Empire West), or Sechs Tank (Floating Empire East) · Mining — Platinum ore nodes in Rune Prana · Box drop — rare drop from boxes in Floating Empire",
  "Orichalcum":"Monster drop — Armed Ghost (Rune Prana Floor 1) · Mining — Orichalcum ore nodes in Leon Karnak and Rune Prana",
  "Dragonic Stone":"Mining — Dragon ore nodes on the final floor of Rune Prana",
  "Amethyst":"Monster drop — Slime (Obsidian Mansion) · Mining — Amethyst nodes in Yokmir Forest and Maya Road",
  "Aquamarine":"Monster drop — Slime (Obsidian Mansion) · Mining — Aquamarine nodes in Water Ruins and Maya Road",
  "Emerald":"Monster drop — Dark Slime (Floating Empire West) · Mining — Emerald nodes in Yokmir Cave and Maya Road",
  "Ruby":"Monster drop — Little Golem (Idra Cave) · Mining — Ruby nodes in Delirium Lava Ruins and Maya Road",
  "Sapphire":"Monster drop — Dark Slime (Floating Empire West) · Mining — Sapphire nodes in Idra Cave and Maya Road",
  "Diamond":"Monster drop — Crystal Mammoth (Sechs Territory, Rune Prana Floor 3, and Sharance Maze: Smoldering Prominence Lv. 8), G Golem (Rune Prana Floor 7 and Sharance Maze: Garden of Light Lv. 8), Golem (Floating Empire), or Sechs Golem (Floating Empire West) · Mining — Diamond nodes in Sechs Territory",
  "Earth Crystal":"Monster drop — Gaias (Idra Cave), Olive (Rune Prana Floor 7), or Yellow (Sercerezo Hill) · Mining — mineral nodes in Yokmir Forest and Amethyst nodes in Yokmir Forest or Maya Road · Gate drop — rare drop from earth-elemental Gates",
  "Water Crystal":"Monster drop — Blue (Sechs Territory), Death Wall (Rune Prana Floor 6 and Sharance Maze: Deepwater Shrine Lv. 8), Marin (Rune Prana Floor 7), or Tundra (Sechs Territory) · Mining — Aquamarine mineral nodes in Water Ruins and Maya Road · Gate drop — rare drop from water-elemental Gates",
  "Wind Crystal":"Monster drop — Emerald (Rune Prana Floor 7), Green (Maya Road), or Airror (Maya Road) · Mining — Emerald mineral nodes in Yokmir Cave and Maya Road · Gate drop — rare drop from wind-elemental Gates",
  "Fire Crystal":"Monster drop — Ignis (Delirium Lava Ruins), Red (Autumn Road), or Rouge (Rune Prana Floor 7) · Mining — Ruby mineral nodes in Delirium Lava Ruins and Maya Road · Gate drop — rare drop from fire-elemental Gates",
  "Small Crystal":"Monster drop — Dark Slime (Floating Empire West), Dead Tree (Yokmir Forest, Rune Prana Floor 7, and Sharance Maze: Smoldering Prominence Lv. 2), Elemental Emperor (Rune Prana Floor 6), Emerald (Rune Prana Floor 7), Flare Mage (Rune Prana Floors 1 and 7), Green Dragon (Rune Prana Floor 1), Ice Wizard (Rune Prana Floors 5 and 7), Little Emperor (Leon Karnak), Little Mage (Idra Cave), Little Wizard (Sechs Territory), Marin (Rune Prana Floor 7), Olive (Rune Prana Floor 7), Ragnarok (Rune Prana Floor 7 and Sharance Maze), Red Dragon (Rune Prana Floor 4), Rouge (Rune Prana Floor 7), Sarcophagus (Leon Karnak), Slime (Obsidian Mansion), or Yellow Dragon (Rune Prana Floors 6 and 7) · Mining — rare result from Scrap, Silver, Gold, and Orichalcum ore nodes",
  "Big Crystal":"Mining — can be mined from any ore node with high Mining skill",
  "Invisible Stone":"Mining — can be mined from any ore node",
  "Light Ore":"Mining — can be mined from any gemstone node with high Mining skill",
  "Shade Stone":"Mining — Shade ore node in the darkened area of Obsidian Mansion",
  "Scrap Metal":"Crafting/forging — result of a failed recipe · Mining — common drop from any mineral ore",
  "Scrap Metal+":"Crafting/forging — rare result of a failed recipe",
  "Golem Spirit Stone":"Monster drop — Guardian (Rune Prana Floor 6)",
  "Round Stone":"Fishing — waterfall area of Yokmir Forest",
  "White Stone":"Field pickup — Sechs Territory, only while the player is in a party with their spouse and child",
  "Object X":"Medicine mixing — result of a failed recipe",
};

export function getMaterialSource(name: string): string | undefined {
  let farming:string | undefined;
  if (treeFruitNames.has(name)) farming = `Farming — grows on a fruit tree; its tree seed can be bought at Sincerity General Store`;
  else if (cropNames.has(name)) farming = `Farming — grow ${name} from its seed; seeds can be bought at Sincerity General Store`;
  else if (giantCropNames.has(name)) farming = `Farming — apply Giantizer to its normal crop; giant crops have no seeds`;
  else if (flowerNames.has(name)) farming = `Farming — grow ${name} from its seed; seeds can be bought at Carnation's${["Green Crystal","Blue Crystal","Red Crystal","White Crystal"].includes(name) ? " · Field pickup — Crystal Flower Tree at Sercerezo Hill" : ""}`;
  else if (giantFlowerNames.has(name)) farming = `Farming — apply Giantizer to its normal flower; giant flowers have no seeds`;
  const source=[farming,wildSources[name],monsterSources[name]].filter(Boolean).join(" · ");
  return source?sortMonsterDropSource(source):undefined;
}
