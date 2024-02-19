import type { Key } from "react";
import type { SortCriteria } from "./types";

type SortableObject = { [key: Key]: string | number; }

export const sortBy = <T extends SortableObject>(arr: Array<T>, sortMethod: SortCriteria) => {
    arr.sort((a: T, b: T): number => {
        let sortResult = 0;
        sortMethod.forEach(m => {
            if (sortResult !== 0) return;
            if (m.direction === 'descending') {
                if (a[m.key] > b[m.key]) {
                    sortResult = -1;
                    return;
                }
                if (a[m.key] < b[m.key]) {
                    sortResult = 1;
                    return;
                }
            }
            else {
                if (a[m.key] < b[m.key]) {
                    sortResult = -1;
                    return;
                }
                if (a[m.key] > b[m.key]) {
                    sortResult = 1;
                    return;
                }
            }
        });
        return sortResult;
    });
    return arr;
}