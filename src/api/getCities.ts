import { cities } from 'data/worldcities/cities';
import type { CityRaw } from 'data/worldcities/cities';
import type { SortCriteria } from 'helpers/types';
import type { Key } from 'react';

type SearchOptions = Partial<{
  limit: number;
  offset: number;
  searchTerm: string;
  sortMethod?: SortCriteria;
}>;

export type City = {
  id: number;
  name: string;
  nameAscii: string;
  country: string;
  countryIso3: string;
  capital: string;
  population: number;
};

const collator = new Intl.Collator('en', { sensitivity: 'base' });

export const getCities = async ({
  limit = 10000,
  offset = 0,
  searchTerm,
  sortMethod
}: SearchOptions = {}): Promise<{ cities: City[], totalEntries: number }> => {

  let filteredList: CityRaw[];
  if (!searchTerm) {
    filteredList = cities;
  } else {
    if (collator.compare(searchTerm, 'error') === 0) {
      throw new Error('Something terrible just happened!');
    }

    filteredList = cities.filter((c: CityRaw): boolean =>
      // City name
      collator.compare(c[2], searchTerm) === 0 ||
      // Country name
      collator.compare(c[3], searchTerm) === 0);
  }

  const keyToIndex: Record<Key, number> = {
    id: 0,
    name: 1,
    nameAscii: 2,
    country: 3,
    countryIso3: 4,
    capital: 5,
    population: 6
  };

  if (sortMethod) {
    filteredList.sort((a: CityRaw, b: CityRaw): number => {
      let sortResult = 0;
      sortMethod.forEach(m => {
        if (sortResult !== 0) return;
        if (m.direction === 'descending') {
          if (a[keyToIndex[m.key]] > b[keyToIndex[m.key]]) {
            sortResult = -1;
            return;
          }
          if (a[keyToIndex[m.key]] < b[keyToIndex[m.key]]) {
            sortResult = 1;
            return;
          }
        }
        else {
          if (a[keyToIndex[m.key]] < b[keyToIndex[m.key]]) {
            sortResult = -1;
            return;
          }
          if (a[keyToIndex[m.key]] > b[keyToIndex[m.key]]) {
            sortResult = 1;
            return;
          }
        }
      });
      return sortResult;
    });
  }

  return {
    cities: filteredList.slice(offset, offset + limit).map((row: CityRaw) => ({
      id: row[0],
      name: row[1],
      nameAscii: row[2],
      country: row[3],
      countryIso3: row[4],
      capital: row[5],
      population: row[6],
    })),
    totalEntries: filteredList.length
  };
}
