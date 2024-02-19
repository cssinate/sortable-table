import React, { useEffect, useState } from 'react';
import type { SortCriteria } from 'helpers/types';
import { Table, type TableProps } from 'components/otherComponents/Table';
import { IconButton } from 'components/otherComponents/IconButton';
import { SearchField } from 'components/otherComponents/SearchField';
import { IconFirstPage, IconLastPage, IconChevronLeft, IconChevronRight, IconSpinner, IconAlert } from 'components/icons';


type SortableTableProps = TableProps & {
    error?: string;
    defaultSearchTerm?: string;
    onSearchTermChange: (searchTerm: string) => void;
    /** Will be used to fill in the blank for "Search for ______" */
    searchTopic?: string;
    debounceDelay?: number;
    /** Must be one of 10, 25, 50 or 100 **/
    itemsPerPage: number;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    isSearching?: boolean;
    onQueryOffsetChange?: (offset: number) => void;
    totalItems: number;
}

export { type SortCriteria }

export const SortableTable = ({
    columns,
    rows,
    itemsPerPage,
    defaultSearchTerm,
    onSearchTermChange,
    searchTopic,
    debounceDelay,
    totalItems,
    onQueryOffsetChange,
    isSearching,
    error,
    ...props
}: SortableTableProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const offset = (currentPage - 1) * itemsPerPage;

    useEffect(() => {
        onQueryOffsetChange?.(offset);
    }, [offset, onQueryOffsetChange])

    const isFirstPageDisabled = currentPage === 1;
    const isLastPageDisabled = (currentPage * itemsPerPage) >= totalItems;

    const handleItemsPerPageChange = (i: number) => {
        props.onItemsPerPageChange(i);
        setCurrentPage(1);
    }

    const handleSearchTermChange = (searchTerm: string) => {
        onSearchTermChange(searchTerm);
        setCurrentPage(1);
    }

    const [currentRows, setCurrentRows] = useState(rows);
    useEffect(() => {
        // Prevents table from shrinking to no rows during data propagation.
        if (!isSearching) setCurrentRows(rows)
    }, [rows, isSearching]);

    return (
        <div className="sortableTable">
            <SearchField onChange={handleSearchTermChange} defaultValue={defaultSearchTerm} debounceDelay={debounceDelay} searchTopic={searchTopic} />
            <div className={`sortableTable__message`}>
                {/* <SearchMessage hidden={!isSearching} key="searchMessage" /> */}
                {isSearching ? 'Searching...' : null}
                {error ? <ErrorMessage>{error}</ErrorMessage> : null}
                {!rows.length ? <NoResults /> : null}
            </div>
            <div className="sortableTable__results">
                <Table {...props} columns={columns} rows={currentRows} />
                <SortableTablePagination itemsPerPage={itemsPerPage} totalItems={totalItems} currentPage={currentPage} onCurrentPageChange={setCurrentPage} handleItemsPerPageChange={handleItemsPerPageChange} isFirstPageDisabled={isFirstPageDisabled} isLastPageDisabled={isLastPageDisabled} />
            </div>
        </div>
    )
};

type PaginationProps = {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    onCurrentPageChange: (page: number) => void;
    handleItemsPerPageChange: (itemsPerPage: number) => void;
    isFirstPageDisabled: boolean;
    isLastPageDisabled: boolean;
}

const SortableTablePagination = ({ itemsPerPage, handleItemsPerPageChange, onCurrentPageChange, isFirstPageDisabled, isLastPageDisabled, currentPage, totalItems, }: PaginationProps) => {
    return (
        <div className="sortableTable__pagination">
            <label className='sortableTable__perPage'>
                <div>Per Page:</div>
                <select value={itemsPerPage} onChange={e => handleItemsPerPageChange(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </label>
            <div className="sortableTable__buttons">
                <IconButton onPress={() => onCurrentPageChange(1)} isDisabled={isFirstPageDisabled}><IconFirstPage /></IconButton>
                <IconButton onPress={() => onCurrentPageChange(currentPage - 1)} isDisabled={isFirstPageDisabled}><IconChevronLeft /></IconButton>
                <IconButton key="nextPage" onPress={() => onCurrentPageChange(currentPage + 1)} isDisabled={isLastPageDisabled}><IconChevronRight /></IconButton>
                <IconButton onPress={() => onCurrentPageChange(Math.ceil(totalItems / itemsPerPage))} isDisabled={isLastPageDisabled}><IconLastPage /></IconButton>
            </div>
        </div>
    )
};

const ErrorMessage = ({ children }: { children?: React.ReactNode }) => {
    return <div className="sortableTable__errorMessage"><IconAlert className="icon" /> {children}</div>
}

const SearchMessage = ({ hidden }: { hidden: boolean }) => {
    return <div hidden={hidden}><IconSpinner className="icon icon--spin" /> Searching...</div>
}

const NoResults = () => {
    return <div>No results found</div>
}