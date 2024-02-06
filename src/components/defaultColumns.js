import { cellTypes as ct } from "./datagridUtils";

/**
 * Arquivo que contém os arrays de referência para o restante das funções do datagrid.
 * Esse é o único arquivo que deve variar entre cada implementação do datagrid.
 */ 

/**
 * @template
 * Array[
 *  { title: "Exibido no Cabeçalho do Grid", id: "chaveNoArrayDeDados", width: 100 }
 * ]
 */
export const defaultColumns = [
  { title: "Name", id: "name", width: 120 },
  { title: "Mana Cost", id: "mana_cost", width: 120 },
  { title: "CMC", id: "cmc", width: 80 },
  { title: "Type", id: "type_line", width: 160 },
  { title: "POW", id: "power", width: 80 },
  { title: "TOU", id: "toughness", width: 80 },
  { title: "Set", id: "set", width: 160 },
  { title: "Nº", id: "collector_number", widht: 80 },
  { title: "Oracle", id: "oracle_text", width: 300 },
  { title: "Flavor Text", id: "flavor_text", width: 300 },
]

/**
 * @template
 * Array [
 *  { id: "chaveNoArrayDeDados", type: cellType, decimalPoint?: int },
 * ]
 */
export const referenceArray = [
  { id: "name", type: ct.text },
  { id: "mana_cost", type: ct.text },
  { id: "cmc", type: ct.text },
  { id: "type_line", type: ct.text },
  { id: "power", type: ct.number },
  { id: "toughness", type: ct.number },
  { id: "set", type: ct.text },
  { id: "collector_number", type: ct.number },
  { id: "oracle_text", type: ct.text },
  { id: "flavor_text", type: ct.text },
];