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
  "Raccoon Leaf",
  "Glitta Augite",
  "4-Leaf Clover",
  "Great 4-Leaf Clover",
  "Giant 4-Leaf Clover",
  "Invisible Stone",
  "White Stone",
  "Shade Stone",
  "Rare Can",
]);

export function optimizerMaterialAllowed(material:OptimizerRuleMaterial,recipe:OptimizerRuleRecipe):boolean {
  // Cores are reserved for the complete Green → Red → Yellow → Blue sequence.
  if(material.core)return false;
  // Scale printed stats apply to every equipment type. Only a Shield using Wet
  // Scale is invalid for the separate shield-stat inheritance special effect.
  if(material.category==="Scales")return recipe.group!=="Shield"||!['Wet Scale','Wet Scales'].includes(material.name);
  // Armor receives printed Crystal stats but the weapon imbuement is invalid, and
  // upgrade-only weapon effects likewise produce a warning that rejects a plan.
  if(recipe.type==="armor"&&(material.element||WEAPON_ONLY_UPGRADES.has(material.name)))return false;
  return true;
}
