import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";

// constantes de padronização.
const ERROR = "#error";

export const cellTypes = {
  text: "text",
  number: "number",
  decimal: "number",
};

/**
 * Função auxiliar para atualização do array de dados do datagrid.
 * @param {string | int | float} newData 
 * @param {[int | int]} cell 
 * @param {Array} oldArray 
 * @param {Array[int]} indexes 
 * @returns retorna o array atualizado e a linha atualizada com os novos valores.
 */
export function updateGridDataArray(newData, cell, oldArray, indexes) {
  const [col, row] = cell;
  const key = indexes[col];

  let updatedRow;
  const updatedArray = oldArray.map((obj) => {
    if (isEqual(obj, oldArray[row])) {
      updatedRow = {
        ...obj,
        [key]: newData.data,
      }
      return updatedRow;
    }
    return obj;
  });

  return [updatedArray, updatedRow];
}

/**
 * Função Auxiliar para futuras melhorias
 * @param {Array} columnsArray 
 * @returns {Array}
 */
function getResizableColumns(columnsArray){
  return [...columnsArray];
}

/**
 * Função de formatação dos valores individuais de cada célula.
 * @param {string} inputValue 
 * @param {"text" | "number"} desiredCellType 
 * @param {int | null} decimalPoint 
 * @returns {[desiredCellType, string, desiredCellType]} valores formatados da célula.
 */
export function formatGridCellContent(
  inputValue,
  desiredCellType = cellTypes.text,
  decimalPoint = null,
){
  if (inputValue === ERROR) return [inputValue, inputValue, desiredCellType];

  let parsedValue;
  let displayData;

  const value = (inputValue === null || inputValue === undefined) ? 0 : inputValue;

  if (decimalPoint !== null) {
    parsedValue = parseFloat(value.toFixed(decimalPoint));
    displayData = parsedValue.toFixed(decimalPoint);
  } else if (desiredCellType === cellTypes.number) {
    parsedValue = parseInt(value);
    displayData = String(parsedValue);
  } else if (desiredCellType === cellTypes.text) {
    parsedValue = String(value);
    displayData = String(value);
  } else {
    parsedValue = ERROR;
    displayData = ERROR;
    return [parsedValue, displayData, cellTypes.text];
  }
  
  return [parsedValue, displayData, desiredCellType];
}

/**
 * Função para recuperar apenas os ids do conjunto de dados.
 * @param {Array} columnsArray 
 * @returns {Array} array de indexes das colunas.
 */
export const columnsIndexes = (columnsArray) => {
  return getResizableColumns(columnsArray).map(c => c.id);
}

/**
 * Função auxiliar para exibir um valor de erro em caso de problemas na aquisição de dados via chamada HTTP.
 * @param {Array} columnsArray 
 * @param {int} rowsAmount 
 * @returns {Array} Array de colunas com valor padrão "#error"
 */
export const errorRow = (columnsArray, rowsAmount) => {
  const columnsIndx = columnsIndexes(columnsArray);
  const rowObj = columnsIndx.reduce((acc, curr) => {
    return {
      ...acc,
      [curr]: ERROR,
    }
  }, {});

  const errorRows = [];
  for(let i = 0; i < rowsAmount; i += 1) {
    errorRows.push(rowObj);
  }

  return errorRows;
}

/**
 * CustomHook de redimensionamento das colunas do datagrid. Recebe o array de colunas a serem exibidas no datagrid e retorna funções de uso.
 * @param {Array} columnsArray 
 * @param {int} rowsAmount 
 * @returns 
 */
export default function useResizableColumns(columnsArray, rowsAmount = 3) {
  const [colsMap, setColsMap] = useState(() => getResizableColumns(columnsArray));

  useEffect(() => {
    setColsMap(getResizableColumns(columnsArray));
  }, [columnsArray]);

  /**
   * Função auxiliar para redimensionamento das colunas do datagrid.
   * @param {Array} columns
   * @param {int} newSize
   * @returns {Array} Array com nova width da coluna.
   */
  const onColumnResize = useCallback((columns, newSize) => {
    setColsMap((prevColsMap) => {
      const index = prevColsMap.findIndex(ci => ci.title === columns.title);
      const newArray = [...prevColsMap];
      newArray.splice(index, 1, {
        ...prevColsMap[index],
        width: newSize,
      });

      return newArray;
    });
  }, []);

  const cols = useMemo(() => [...colsMap], [colsMap]);

  const errorArray = useMemo(() => errorRow(columnsArray, rowsAmount), [columnsArray, rowsAmount]);

  return { gridColumns: cols, onColumnResize, errorArray};
};

/**
 * customHook que retorna as funções auxiliares do Datagrid de exibição e atualização dos valores de cada célula.
 * @param {Array | React.ComponentState<Array>} renderList Array de dados mostrado no datagrid. React State.
 * @param {React.SetStateAction<Function>} setRenderList Função de alteração do estado da renderList.
 * @param {Function} handleUpdatedRows Função de update das alterações não enviadas para a API.
 * @param {Array} columnsArray Array de colunas parte do retorno do customHook {@link useResizableColumns}
 * @param {Array} formatingReferenceArray Array de Object no formato { id: string, type: {@link cellTypes}, decimalPoint?: int };
 * @param {Boolean} debug Exibe consoles auxiliares de valores caso True.
 * @returns {{getCellContent, onCellEdited}} funções auxiliares do Datagrid de exibição e alteração dos valores de cada célula do Datagrid.
 */
export const useGridCells = (
  renderList,
  setRenderList,
  handleUpdatedRows,
  columnsArray,
  formatingReferenceArray = null,
  debug = false,
  ) => {
  const indexes = columnsIndexes(columnsArray);

  /**
   * Função utilizada internamente pelo Datagrid para obtenção de um objeto do tipo Cell.
   */
  const getCellContent = useCallback((cell) => {
    const [col, row] = cell;

    if (renderList.length === 0) {
      return {
        kind: cellTypes.text,
        allowOverlay: true,
        readOnly: true,
        displayData: " ",
        contentAlign: "left",
        data: " ",
      }
    }

    const dataRow = renderList[row];
    const reference = indexes[col];

    if (debug) {
      console.log(`${reference}`);
      console.log(renderList);
      console.log(`${typeof dataRow[reference]}`);
      console.log(`${dataRow[reference]}`);
    }

    const getParameters = [dataRow[reference]];
    if (formatingReferenceArray !== null) {
      const cellReference = formatingReferenceArray.find((ref) => ref.id === reference);
      const desiredCellType = cellReference.type;

      getParameters.push(desiredCellType);
      if (cellReference.decimalPoint) {
        getParameters.push(cellReference.decimalPoint);
      }
    };

    const [cellData, display, cellType] = formatGridCellContent(...getParameters);

    const readOnly = cellType === cellTypes.text ? true : false;

    return {
      kind: cellType,
      allowOverlay: !readOnly,
      displayData: String(display),
      contentAlign: cellType === cellTypes.text ? "left" : "right",
      data: cellData,
      readOnly,
    };
  }, [renderList, indexes, formatingReferenceArray, debug]);

  /**
   * Função utilizada internamente pelo Datagrid para edição dos valores do datagrid.
   */
  const onCellEdited = useCallback((cell, newValue) => {
    if (newValue.kind !== cellTypes.text && newValue.kind !== cellTypes.number) return;

    const [newData, updatedRow] = updateGridDataArray(newValue, cell, renderList, indexes);
    setRenderList(newData);
    handleUpdatedRows(updatedRow);
  }, [renderList, indexes, handleUpdatedRows, setRenderList]);

  return { getCellContent, onCellEdited };
};
