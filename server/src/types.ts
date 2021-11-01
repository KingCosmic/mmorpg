
export enum ItemType {
  WEAPON = 'weapon',
  PICKAXE = 'pickaxe',
  AXE = 'axe'
}

export interface Item {
  id:string
  icon:string
  name:string
  type:ItemType
}

export interface InputType {
  isn:number
  v:number
  h:number
  s:boolean
  action:boolean
}