import assert from "node:assert/strict";
import test from "node:test";
import { attainableWeaponRanges, coreStatConversions, crossCategoryDonorAvailability, nonStackingDropWarnings, optimizerMaterialAllowed, requiredSpecialUpgradeNames, scaleSpecialWarning, weaponBaseRange } from "../app/optimizer-rules.ts";

const weapon={group:"Short Sword",type:"weapon"};
const shield={group:"Shield",type:"armor"};
const armor={group:"Armor",type:"armor"};

test("keeps Scale stats available outside Shields while excluding Wet Scale from Shield plans",()=>{
  assert.equal(optimizerMaterialAllowed({name:"Earthwyrm Scale",category:"Scales"},shield),true);
  assert.equal(optimizerMaterialAllowed({name:"Earthwyrm Scale",category:"Scales"},weapon),true);
  assert.equal(optimizerMaterialAllowed({name:"Earthwyrm Scale",category:"Scales"},armor),true);
  assert.equal(optimizerMaterialAllowed({name:"Wet Scale",category:"Scales"},shield),false);
  assert.equal(optimizerMaterialAllowed({name:"Wet Scale",category:"Scales"},weapon),true);
});

test("converts STR, INT, and VIT into final combat stats",()=>{
  assert.deepEqual(coreStatConversions({str:300,int:140,vit:4510}),{
    atk:300,
    matk:140,
    def:2255,
    mdef:2255,
  });
});

test("does not reject Scale stats outside Shields",()=>{
  assert.equal(scaleSpecialWarning("Short Sword",["Firewyrm Scale"]),undefined);
  assert.equal(scaleSpecialWarning("Staff",["Blue Scale"]),undefined);
  assert.equal(scaleSpecialWarning("Armor",["Earthwyrm Scale"]),undefined);
  assert.equal(scaleSpecialWarning("Shield",["Firewyrm Scale"]),undefined);
  assert.equal(scaleSpecialWarning("Shield",["Wet Scale"]),"Wet Scale does not enable shield-stat inheritance.");
});

test("reserves colored Cores for their complete armor sequence",()=>{
  assert.equal(optimizerMaterialAllowed({name:"Green Core",category:"Jewels",core:"green"},shield),false);
  assert.equal(optimizerMaterialAllowed({name:"Green Core",category:"Jewels",core:"green"},weapon),false);
});

test("excludes weapon-only and elemental candidates from armor searches",()=>{
  assert.equal(optimizerMaterialAllowed({name:"Raccoon Leaf",category:"Misc."},armor),false);
  assert.equal(optimizerMaterialAllowed({name:"Fire Crystal",category:"Crystals",element:"fire"},armor),false);
  assert.equal(optimizerMaterialAllowed({name:"Raccoon Leaf",category:"Misc."},weapon),true);
  assert.equal(optimizerMaterialAllowed({name:"Fire Crystal",category:"Crystals",element:"fire"},weapon),true);
  assert.equal(optimizerMaterialAllowed({name:"Dragonic Stone",category:"Minerals"},armor),true);
  assert.equal(optimizerMaterialAllowed({name:"4-Leaf Clover",category:"Raw Ingredients"},armor),true);
  assert.equal(optimizerMaterialAllowed({name:"Great 4-Leaf Clover",category:"Raw Ingredients"},armor),true);
  assert.equal(optimizerMaterialAllowed({name:"Invisible Stone",category:"Misc."},armor),true);
});

test("enables cross-category donors only when a Weapon or Staff has two open slots",()=>{
  assert.deepEqual(crossCategoryDonorAvailability({group:"Short Sword",type:"weapon"},4),{
    allowed:true,
    reason:"Uses one crafting slot for the donor and one for Light Ore.",
  });
  assert.deepEqual(crossCategoryDonorAvailability({group:"Staff",type:"staff"},4),{
    allowed:true,
    reason:"Uses one crafting slot for the donor and one for Light Ore.",
  });
  assert.equal(crossCategoryDonorAvailability({group:"Short Sword",type:"weapon"},5).allowed,false);
  assert.match(crossCategoryDonorAvailability({group:"Short Sword",type:"weapon"},5).reason,/No room for Light Ore/);
  assert.equal(crossCategoryDonorAvailability({group:"Shield",type:"armor"},2).allowed,false);
  assert.match(crossCategoryDonorAvailability({group:"Shield",type:"armor"},2).reason,/Weapons and Staffs only/);
});

test("derives range from the crafted weapon category",()=>{
  assert.equal(weaponBaseRange("Short Sword"),1);
  assert.equal(weaponBaseRange("Long Sword"),1.2);
  assert.equal(weaponBaseRange("Spear"),1.8);
  assert.equal(weaponBaseRange("Dual Blades"),.95);
  assert.equal(weaponBaseRange("Gloves"),.95);
  assert.equal(weaponBaseRange("Staff"),undefined);
  assert.equal(weaponBaseRange("Tool"),undefined);
});

test("offers only attainable capped weapon ranges",()=>{
  const ranges=attainableWeaponRanges("Short Sword");
  assert.ok(ranges.includes(1));
  assert.ok(ranges.includes(1.25));
  assert.ok(ranges.includes(1.5));
  assert.ok(ranges.includes(4));
  assert.ok(!ranges.includes(1.333));
  assert.ok(ranges.every(value=>value>=1&&value<=4));
  assert.deepEqual(attainableWeaponRanges("Staff"),[]);
  assert.deepEqual(attainableWeaponRanges("Spear",1),[1.8,2.05,2.3]);
  assert.deepEqual(attainableWeaponRanges("Short Sword",7,4.5),[4]);
});

test("reserves required special-effect sequences before stat optimization",()=>{
  assert.deepEqual(requiredSpecialUpgradeNames({
    specialRequirements:["fourCore","clover","rareCan","invisibleStone","shadeStone"],
    lowRarity:false,
    forceTenfoldGlitta:true,
    autoFourCore:false,
  }),[
    "Green Core","Red Core","Yellow Core","Blue Core",
    "Great 4-Leaf Clover","Rare Can","Invisible Stone","Shade Stone",
    "Glitta Augite","10-Fold Steel",
  ]);
  assert.deepEqual(requiredSpecialUpgradeNames({specialRequirements:["clover"],lowRarity:true,forceTenfoldGlitta:false,autoFourCore:false}),["4-Leaf Clover"]);
});

test("warns when presence-based drop effects are duplicated",()=>{
  assert.deepEqual(nonStackingDropWarnings(["4-Leaf Clover"]),[]);
  assert.equal(nonStackingDropWarnings(["4-Leaf Clover","Great 4-Leaf Clover"]).length,1);
  assert.equal(nonStackingDropWarnings(["Rare Can","Rare Can"]).length,1);
  assert.equal(nonStackingDropWarnings(["4-Leaf Clover","Rare Can"]).length,0);
});
