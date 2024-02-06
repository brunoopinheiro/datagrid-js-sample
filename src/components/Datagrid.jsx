import React, { useCallback, useEffect, useRef, useState } from "react";
// Esse CSS é mandatório para a exibição correta do componente.
import "@glideapps/glide-data-grid/dist/index.css";
import useResizableColumns, { useGridCells } from "./datagridUtils";
import { findPartialMatch } from "../utils/utils";
import { CompactSelection, DataEditor } from "@glideapps/glide-data-grid";

/**
 * @prop defaultColumns: definida no arquivo ./defaultColumns.js
 * @prop referenceArray: definida no arquivo ./defaultColumns.js
 * @prop asyncList: lista obtida à partir da API, valor inicial exibido no datagrid.
 * @returns Datagrid Component
 */
const Datagrid = (props) => {
  // debugger;
  const {
    defaultColumns,
    referenceArray,
    asyncList,
  } = props;

  /**
   * Use o customHook definido no arquivo {@link useResizableColumns} para obter as funções de redimensionamento do datagrid e o array de erros.
   */
  const {
    gridColumns,
    onColumnResize,
    // errorArray,
  } = useResizableColumns(defaultColumns);

  /**
   * Lista de estados e atualizações necessárias para o datagrid.
   * @name fetchedList => representa a lista obtida via get.
   * @name renderList => representa a lista exibida no datagrid.
   * @name updatedRows => representa a lista de alterações que serão enviadas à api ao final das edições.
   * @name showSearch => booleano que representa a exibição ou não do filtro nativo do datagrid.
   * @name searchValue => string com o valor a ser aplicado na busca dos elementos do datagrid.
   * @name searchResults => array com os resultados da busca, aplicado ao filtrar os elementos.
   */
  const [fetchedList, setFetchedList] = useState(asyncList);
  const [renderList, setRenderList] = useState(asyncList);
  const [updatedRows, setUpdatedRows] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Usado para verificar qual elemento está com foco na página.
  const ref = useRef(null);

  const toggleSearch = useCallback(() => setShowSearch(!showSearch), [showSearch]);
  const onSearchClose = useCallback(() => {
    setShowSearch(false);
    setSearchValue("");
  }, []);

  const restoreChanges = useCallback(() => {
    const updatedRowsIds = updatedRows.map((u) => u.id);
    const restoredRenderList = fetchedList.map((row) => {
      if (updatedRowsIds.includes(row.id)) {
        const updated = updatedRows.find((up) => up.id === row.id);
        return updated;
      };
      return row;
    });
    setRenderList(restoredRenderList);
    setSearchResults([]);

    return restoredRenderList;
  }, [fetchedList, updatedRows]);

  const handleSearchResults = useCallback((searchValue) => {
    const restoredRenderList = restoreChanges();
    if (searchValue === "") return;

    const searchResultsArr = restoredRenderList.filter((row) => {
      const values = Object.values(row);
      return findPartialMatch(values, searchValue);
    });

    setSearchResults(searchResultsArr);
    setRenderList(searchResultsArr);
  }, [restoreChanges]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === "f") {
        event.stopPropagation();
        event.preventDefault();
        toggleSearch();
      };

      if (event.key === "Enter" && document.activeElement === ref.current) {
        event.stopPropagation();
        event.preventDefault();
        handleSearchResults(searchValue);
      };
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleSearch, handleSearchResults, searchValue]);

  const [selection, setSelection] = useState({
    rows: CompactSelection.empty(),
    columns: CompactSelection.empty(),
  });

  const sendUpdatesToApi = useCallback(() => {
    console.log(updatedRows);
  }, [updatedRows]);

  const handleUpdatedRows = useCallback((updatedRow) => {
    const unsentModifications = updatedRows.filter((row) => (row.key !== updatedRow.key));
    setUpdatedRows([...unsentModifications, updatedRow]);
  }, [updatedRows]);

  const discardChanges = useCallback(() => {
    setUpdatedRows([]);
    setSearchValue("");
    setSearchResults([]);
    setRenderList(asyncList);
    setFetchedList(asyncList);
  }, [asyncList]);

  const { getCellContent, onCellEdited } = useGridCells(
    renderList,
    setRenderList,
    handleUpdatedRows,
    gridColumns,
    referenceArray,
  );

  return (
    <div className="datagrid-container">
      <div>
        <input
          type="text"
          value={ searchValue }
          onChange={ (event) => setSearchValue(event.target.value) }
        />
        <button
          onClick={ () => handleSearchResults(searchValue) }
        >
          Filtrar
        </button>
        <button
          onClick={ () => {
            setSearchValue("");
            restoreChanges();
          }}
        >
          Limpar
        </button>
        <button
          onClick={ sendUpdatesToApi }
        >
          Salvar
        </button>
        <button
          onClick={ discardChanges }
        >
          Descartar
        </button>
      </div>
      <DataEditor
        columns={ gridColumns }
        rows={ searchResults.length === 0 ? renderList.length : searchResults.length }
        width={ 1400 }
        height={ 600 }
        overscrollY={ 40 }
        overscrollX={ 40 }
        freezeColumns={ 1 }
        getCellContent={ getCellContent }
        onCellEdited={ onCellEdited }
        rowMarkers="both"
        smoothScrollX={ true }
        smoothScrollY={ true }
        scaleToRem={ true }
        getCellsForSelection={ true }
        showSearch={ showSearch }
        onSearchClose={ onSearchClose }
        gridSelection={ selection }
        onGridSelectionChange={ setSelection }
        onColumnResize={ onColumnResize }
      />
    </div>
  );
}

export default Datagrid;