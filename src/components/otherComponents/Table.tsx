import type { AriaTableProps, AriaTableCellProps, AriaTableColumnHeaderProps } from 'react-aria';
import { usePress } from 'react-aria';
import { mergeProps, useFocusRing, useTable, useTableCell, useTableRowGroup, useTableHeaderRow, useTableColumnHeader, useTableRow, useTableSelectAllCheckbox, VisuallyHidden } from 'react-aria';
// useTableSelectionCheckbox
import { Cell, Column, Row, TableBody, TableHeader, type TableState, type TableStateProps } from 'react-stately';
import { useTableState } from 'react-stately';
import React, { useRef, type Key } from 'react';
import { IconSort, IconArrowDown, IconArrowUp } from 'components/icons';
import type { SortCriteria } from 'helpers/types';

type CellProps<T> = {
    cell: AriaTableCellProps['node'],
    state: TableState<T>
}

type HeaderCellProps<T> = {
    column: AriaTableColumnHeaderProps<T>['node'],
    state: TableState<T>
}

type HeaderRowProps<T> = {
    item: TableState<T>['collection']['headerRows'][number];
    state: TableState<T>;
    children?: React.ReactNode;
}

export type TableColumnProps = {
    name: string;
    /**
     * Key must be present in the row data
     */
    key: Key;
    allowSort?: boolean;
}

type BaseTableProps = {
    /**
     * If rows are to be selectable, either one row can be selected at a time or multiple can.
     */
    selectionMode?: 'single' | 'multiple';
    /**
     * Allow sorting by zero, one or more columns. If `multi`, user can hold Shift key to sort by additional columns.
     */
    columnSort?: 'multiple' | 'single' | 'none';
    /**
     * The order in which columns are to be sorted and their methods of sorting. Only columns containing string or number can be sorted.
     */
    sortMethod?: SortCriteria;
    onSortMethodChange?: (sortMethod: SortCriteria) => void;
}
export type TableProps = BaseTableProps & {
    columns: TableColumnProps[];
    // eslint-disable-next-line no-unused-vars
    rows: Array<{ id: Key } & { [x: Key]: React.ReactNode }>;
} & ({
    /** The label describing the table contents */
    'aria-label': string;
    'aria-labelledby'?: never;
} | {
    'aria-label'?: never;
    /** The label describing the table contents */
    'aria-labelledby': string;
})

export const Table = (props: TableProps) => {
    return (
        <TableLogic {...props}>
            <TableHeader columns={props.columns}>
                {column => (
                    <Column allowsSorting={column.allowSort !== false && props.columnSort !== 'none'}>
                        {column.name}
                    </Column>
                )}
            </TableHeader>
            <TableBody items={props.rows}>
                {item => (
                    <Row>
                        {columnKey => <Cell>{item[columnKey]}</Cell>}
                    </Row>
                )}
            </TableBody>
        </TableLogic>
    )
}

const TableLogic = <T extends object>(props: AriaTableProps<T> & TableStateProps<T> & BaseTableProps) => {
    const { selectionMode } = props;
    const state = useTableState({
        ...props,
        onSortChange: () => { return; },
        showSelectionCheckboxes: selectionMode === 'multiple'
    });

    const ref = useRef<HTMLTableElement>(null);
    const { collection } = state;
    const { gridProps } = useTable({ ...props, focusMode: 'row' }, state, ref);

    return (
        <table {...gridProps} ref={ref} className='table'>
            <TableRowGroup type="thead">
                {collection.headerRows.map((headerRow) => {
                    const children = collection.getChildren?.(headerRow.key) ?? [];
                    return (
                        <TableHeaderRow key={headerRow.key} item={headerRow} state={state}>
                            {[...children].map((column) =>
                                column.props.isSelectionCell
                                    ? (
                                        <TableSelectAllCell
                                            key={column.key}
                                            column={column}
                                            state={state}
                                        />
                                    )
                                    : (
                                        <TableColumnHeader
                                            key={column.key}
                                            column={column}
                                            state={state}
                                            columnSort={props.columnSort}
                                            sortMethod={props.sortMethod || []}
                                            onSortMethodChange={props.onSortMethodChange}
                                        />
                                    )
                            )}
                        </TableHeaderRow>
                    )
                })}
            </TableRowGroup>
            <TableRowGroup type="tbody">
                {[...collection].map((row) => (
                    <TableRow key={row.key} item={row} state={state}>
                        {[...collection.getChildren?.(row.key) ?? []].map((cell) =>
                            cell.props.isSelectionCell
                                ? <TableCheckboxCell key={cell.key} cell={cell} state={state} />
                                : <TableCell key={cell.key} cell={cell} state={state} />
                        )}
                    </TableRow>
                ))}
            </TableRowGroup>
        </table>
    );
}

const TableRowGroup = ({ type: Element, children }: { type: React.ElementType, children?: React.ReactNode }) => {
    const { rowGroupProps } = useTableRowGroup();
    return (
        <Element
            {...rowGroupProps}
            className={Element === 'thead'
                ? 'table__head'
                : 'table__body'}
        >
            {children}
        </Element>
    );
}

const TableHeaderRow = <T extends object>({ item, state, children }: HeaderRowProps<T>) => {
    const ref = useRef<HTMLTableRowElement>(null);
    const { rowProps } = useTableHeaderRow({ node: item }, state, ref);

    return (
        <tr className="table__headerRow" {...rowProps} ref={ref}>
            {children}
        </tr>
    );
}

const TableColumnHeader = <T extends object>({ column, sortMethod, onSortMethodChange, columnSort, state }: HeaderCellProps<T> & Pick<TableProps, 'sortMethod' | 'onSortMethodChange' | 'columnSort'>) => {
    const ref = useRef<HTMLTableCellElement>(null);
    const { columnHeaderProps } = useTableColumnHeader(
        { node: column },
        state,
        ref
    );
    const { isFocusVisible, focusProps } = useFocusRing();
    const sortObjectIndex = sortMethod?.findIndex((sort) => sort.key === column.key);
    const sortObject = sortMethod && sortObjectIndex !== undefined ? sortMethod[sortObjectIndex] : undefined;
    const sortDirection = sortObject ? sortObject.direction : null;
    const otherSortMethods = sortMethod?.filter((sort) => sort.key !== column.key) || [];

    const { pressProps } = usePress({
        onPress: (e) => {
            if (column.props.allowsSorting) {
                switch (sortDirection) {
                    case 'ascending':
                        columnSort === 'multiple' && e.shiftKey ? onSortMethodChange?.([...otherSortMethods, { key: column.key, direction: 'descending' }]) : onSortMethodChange?.([{ key: column.key, direction: 'descending' }]);
                        break;
                    case 'descending':
                        columnSort === 'multiple' && e.shiftKey ? onSortMethodChange?.(otherSortMethods) : onSortMethodChange?.([]);
                        break;
                    case null:
                    default:
                        columnSort === 'multiple' && e.shiftKey ? onSortMethodChange?.([...otherSortMethods, { key: column.key, direction: 'ascending' }]) : onSortMethodChange?.([{ key: column.key, direction: 'ascending' }]);
                        break;
                }
            }
        }
    })
    const allowSort = column.props.allowsSorting;
    const shouldShowSortIndex = allowSort && sortMethod !== undefined && sortObjectIndex !== undefined && sortObjectIndex > -1 && sortMethod.length > 1;
    const displayedArrow = sortDirection === 'ascending' ? <IconArrowUp /> : sortDirection === 'descending' ? <IconArrowDown /> : <IconSort />;

    return (
        <th
            className={`table__headerCell  ${columnSort === 'multiple' ? 'table__headerCell--multiSort' : ''} ${isFocusVisible ? 'table__headerCell--focusVisible' : ''}`}
            {...mergeProps(columnHeaderProps, focusProps, pressProps)}
            colSpan={column.colspan}
            ref={ref}
        >
            <div className={`
                    table__headerCellContent
                    ${allowSort ? 'table__headerCellContent--sortable' : ''}
                    ${shouldShowSortIndex ? 'table__headerCellContent--sortIndex' : ''}    
                `}>
                <span>{column.rendered}</span>
                {columnSort === 'multiple' && shouldShowSortIndex ? <span>({sortObjectIndex + 1})</span> : null}
                {column.props.allowsSorting && <span aria-hidden="true">{displayedArrow}</span>}
            </div>
        </th>
    );
}

const TableRow = <T extends object>({ item, children, state }: HeaderRowProps<T>) => {
    const ref = useRef<HTMLTableRowElement>(null);
    const isSelected = state.selectionManager.isSelected(item.key);
    const { rowProps, isPressed } = useTableRow(
        {
            node: item
        },
        state,
        ref
    );
    const { isFocusVisible, focusProps } = useFocusRing();

    return (
        <tr
            className={`
                table__row
                ${isSelected && 'table__row--selected'}
                ${isFocusVisible && 'table__row--focusVisible'}
                ${isPressed && 'table__row--pressed'}
            `}
            {...mergeProps(rowProps, focusProps)}
            ref={ref}
        >
            {children}
        </tr>
    );
}

const TableCell = <T extends object>({ cell, state }: CellProps<T>) => {
    const ref = useRef<HTMLTableCellElement>(null);
    const { gridCellProps } = useTableCell({ node: cell }, state, ref);
    const { isFocusVisible, focusProps } = useFocusRing();

    return (
        <td
            {...mergeProps(gridCellProps, focusProps)}
            className={`table__cell ${isFocusVisible ? 'table__cell--focusVisible' : ''}`}
            ref={ref}
        >
            {cell.rendered}
        </td>
    );
}


const TableCheckboxCell = <T extends object>({ cell, state }: CellProps<T>) => {
    const ref = useRef<HTMLTableCellElement>(null);
    const { gridCellProps } = useTableCell({ node: cell }, state, ref);

    return (
        <td
            {...gridCellProps}
            ref={ref}
        >
            Foo
        </td>
    );
}

const TableSelectAllCell = <T extends object>({ column, state }: HeaderCellProps<T>) => {
    const ref = useRef<HTMLTableCellElement>(null);
    const { columnHeaderProps } = useTableColumnHeader(
        { node: column },
        state,
        ref
    );
    const { checkboxProps } = useTableSelectAllCheckbox(state);

    return (
        <th
            {...columnHeaderProps}
            ref={ref}
        >
            {state.selectionManager.selectionMode === 'single'
                ? <VisuallyHidden>{checkboxProps['aria-label']}</VisuallyHidden>
                : 'Foo'}
        </th>
    );
}