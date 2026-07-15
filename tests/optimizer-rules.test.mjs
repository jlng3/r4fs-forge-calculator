import assert from "node:assert/strict";
import test from "node:test";
import { coreStatConversions, crossCategoryDonorAvailability, optimizerMaterialAllowed, scaleSpecialWarning } from "../app/optimizer-rules.ts";

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
