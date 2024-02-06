import { useEffect } from 'react';
import './App.css';
import { useState } from 'react';
import Datagrid from './components/Datagrid';
import { defaultColumns, referenceArray } from './components/defaultColumns';

const API_URL = "https://api.scryfall.com/cards/search?q=s%3Aclb";

function App() {
  const [fetchedList, setFetchedList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to fetch cards data.");
        }

        const responseJson = await response.json();
        setFetchedList(responseJson.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="App">
     {
      !loading && (
        <Datagrid
          defaultColumns={ defaultColumns }
          referenceArray={ referenceArray }
          asyncList={ fetchedList }
        />
      )
     }
    </div>
  );
}

export default App;
