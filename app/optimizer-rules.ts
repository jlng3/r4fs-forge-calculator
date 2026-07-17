export type OptimizerRuleMaterial = {
  name: string;
  category?: string;
  core?: string;
  element?: string;
};

export type OptimizerRuleRecipe = {
  group: string;
  type: "weapon" | "staff" | "armor";
};

export function coreStatConversions(effects:{str?:number;int?:number;vit?:number}) {
  return {
    atk:effects.str||0,
    matk:effects.int||0,
    def:(effects.vit||0)*0.5,
    mdef:(effects.vit||0)*0.5,
  };
}

const WEAPON_BASE_RANGES:Record<string,number> = {
  "Short Sword":1,
  "Long Sword":1.2,
  Spear:1.8,
  Axe:1,
  Hammer:1,
  "Dual Blades":0.95,
  Gloves:0.95,
};

export function weaponBaseRange(group:string|undefined):number|undefined {
  return group ? WEAPON_BASE_RANGES[group] : undefined;
}

export function attainableWeaponRanges(group:string,maxUpgradeSlots=9,initialBonus=0):number[] {
  const base=weaponBaseRange(group);
  if(base===undefined)return [];
  type State={r:number;g:number;double:boolean;tenfold:boolean;last:number;bonus:number;steps:number};
  let states:State[]=[{r:0,g:0,double:false,tenfold:false,last:0,bonus:initialBonus,steps:0}];
  const totals=new Set<number>([Math.min(4,base+initialBonus)]);
  for(let step=0;step<Math.max(0,maxUpgradeSlots);step++) {
    const next=new Map<string,State>();
    const add=(state:State)=>{
      const rounded=Math.round(Math.min(4,base+state.bonus)*10000)/10000;
      totals.add(rounded);
      const key=[state.r,state.g,Number(state.double),Number(state.tenfold),state.last,state.bonus.toFixed(6)].join("|");
      if(!next.has(key))next.set(key,state);
    };
    for(const state of states) {
      add({...state,r:state.r+1,last:.25,bonus:state.bonus+.25*Math.pow(.5,state.r),steps:state.steps+1});
      add({...state,g:state.g+1,last:.5,bonus:state.bonus+.5*Math.pow(.5,state.g),steps:state.steps+1});
      if(state.last&&!state.double)add({...state,double:true,last:0,bonus:state.bonus+state.last*2,steps:state.steps+1});
      if(state.last&&!state.tenfold)add({...state,tenfold:true,last:0,bonus:state.bonus+state.last*8,steps:state.steps+1});
    }
    states=Array.from(next.values());
  }
  return Array.from(totals).sort((a,b)=>a-b);
}

export function requiredSpecialUpgradeNames(options:{
  specialRequirements:string[];
  lowRarity:boolean;
  forceTenfoldGlitta:boolean;
  autoFourCore:boolean;
}):string[] {
  const {specialRequirements,lowRarity,forceTenfoldGlitta,autoFourCore}=options;
  const names:string[]=[];
  if(autoFourCore||specialRequirements.includes("fourCore"))names.push("Green Core","Red Core","Yellow Core","Blue Core");
  if(specialRequirements.includes("clover"))names.push(lowRarity?"4-Leaf Clover":"Great 4-Leaf Clover");
  if(specialRequirements.includes("rareCan"))names.push("Rare Can");
  if(specialRequirements.includes("invisibleStone"))names.push("Invisible Stone");
  if(specialRequirements.includes("shadeStone"))names.push("Shade Stone");
  if(forceTenfoldGlitta)names.push("Glitta Augite","10-Fold Steel");
  return names;
}

export function nonStackingDropWarnings(upgradeNames:string[]):string[] {
  const clovers=new Set(["4-Leaf Clover","Great 4-Leaf Clover","Giant 4-Leaf Clover"]);
  const warnings:string[]=[];
  if(upgradeNames.filter(name=>clovers.has(name)).length>1)warnings.push("Clover item-drop effects do not stack on the same equipment; keep only one 4-Leaf Clover or Great 4-Leaf Clover unless the extra material is intentional for level, rarity, or printed stats.");
  if(upgradeNames.filter(name=>name==="Rare Can").length>1)warnings.push("Rare Can's rare-item drop effect does not stack with another Rare Can on the same weapon.");
  return warnings;
}

export function scaleSpecialWarning(group:string|undefined,scaleNames:string[]):string|undefined {
  return group==="Shield"&&scaleNames.some(name=>['Wet Scale','Wet Scales'].includes(name))
    ? "Wet Scale does not enable shield-stat inheritance."
    : undefined;
}

const CROSS_CATEGORY_WEAPON_GROUPS = new Set([
  "Short Sword",
  "Long Sword",
  "Spear",
  "Axe",
  "Hammer",
  "Dual Blades",
  "Gloves",
  "Staff",
]);

export function crossCategoryDonorAvailability(recipe:OptimizerRuleRecipe,requiredSlots:number) {
  if(!CROSS_CATEGORY_WEAPON_GROUPS.has(recipe.group))return {
    allowed:false,
    reason:"Cross-category base-stat inheritance is for Weapons and Staffs only.",
  };
  if(6-requiredSlots<2)return {
    allowed:false,
    reason:"No room for Light Ore; a cross-category donor requires two empty crafting slots.",
  };
  return {
    allowed:true,
    reason:"Uses one crafting slot for the donor and one for Light Ore.",
  };
}

const WEAPON_ONLY_UPGRADES = new Set([
  "Scrap Metal+",
  "Shade Stone",
  "Rare Can",
]);

const RANGE_ONLY_UPGRADES = new Set(["Raccoon Leaf","Glitta Augite"]);

export function optimizerMaterialAllowed(material:OptimizerRuleMaterial,recipe:OptimizerRuleRecipe):boolean {
  // Cores are reserved for the complete Green → Red → Yellow → Blue sequence.
  if(material.core)return false;
  // Scale printed stats apply to every equipment type. Only a Shield using Wet
  // Scale is invalid for the separate shield-stat inheritance special effect.
  if(material.category==="Scales")return recipe.group!=="Shield"||!['Wet Scale','Wet Scales'].includes(material.name);
  // Armor receives printed Crystal stats but the weapon imbuement is invalid, and
  // upgrade-only weapon effects likewise produce a warning that rejects a plan.
  if(RANGE_ONLY_UPGRADES.has(material.name)&&weaponBaseRange(recipe.group)===undefined)return false;
  if(recipe.type==="armor"&&(material.element||WEAPON_ONLY_UPGRADES.has(material.name)))return false;
  return true;
}
