import { VariableNumber } from "./itemInstance"

type NoData = {};
export type BaseItemData = ArmorData | WeaponData | StackedItem | NoData

export const INDESTRUCIBLE = 0 as const;
export type Indestrucible = typeof INDESTRUCIBLE;
export type Durability = VariableNumber | Indestrucible

export type ArmorData = {
  defense: VariableNumber
  durability: Durability
}

export type WeaponData = {
  durability: Durability
}

export type StackedItem = {
  quantity: VariableNumber
}