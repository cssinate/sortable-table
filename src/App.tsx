import React, { useState } from 'react';
import { getCities } from 'api/getCities';
import './App.css';

import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { SortableTable, type SortCriteria } from 'components/SortableTable/SortableTable';

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <View />
    </QueryClientProvider>
  )
};

const View = () => {
  const initialSearchTerm = '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  const [sortMethod, setSortMethod] = useState<SortCriteria>([]);

  const { data, error, isLoading } = useQuery({
    queryKey: ['cities', searchTerm, itemsPerPage, offset, sortMethod], queryFn: async () => await getCities({
      limit: itemsPerPage,
      searchTerm,
      offset,
      sortMethod
    })
  })

  const tableColumns = [
    {
      name: 'City',
      key: 'name'
    },
    {
      name: 'Country',
      key: 'country'
    },
    {
      name: 'Population',
      key: 'population'
    },
  ]

  return (
    <div className="App">
      <header className="App-header"></header>
      <h1 id="cityList">City List</h1>
      <SortableTable
        aria-labelledby="cityList"
        columns={tableColumns}
        rows={data?.cities || []}
        error={error?.message}
        defaultSearchTerm={initialSearchTerm}
        onSearchTermChange={setSearchTerm}
        searchTopic='a city'
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        sortMethod={sortMethod}
        onSortMethodChange={setSortMethod}
        onQueryOffsetChange={setOffset}
        isSearching={isLoading}
        totalItems={data?.totalEntries || 0}
        selectionMode='single'
        columnSort='multiple'
      />
    </div>
  );
}

export default App;
