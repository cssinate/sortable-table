import { getCities } from './getCities';

describe('getCities', () => {
  describe('limit', () => {
    it('returns 10,000 records by default', async () => {
      expect((await getCities()).cities.length).toEqual(10000);
    });

    it('returns the number of records specified when limit is set', async () => {
      expect((await getCities({ limit: 2 })).cities.length).toEqual(2);
    });
  });

  describe('offset', () => {
    it('returns the first record in the list by default', async () => {
      expect((await getCities({ limit: 1 })).cities[0].name).toEqual('Tokyo');
    });

    it('returns the correctly offset record when specified', async () => {
      expect((await getCities({ offset: 126, limit: 1 })).cities[0].name).toEqual('Toronto');
    });

    describe('when offset is larger than the data set', () => {
      it('returns an empty array', async () => {
        expect(await getCities({ offset: 100000 })).toEqual([]);
      });
    });
  });

  describe('filter', () => {
    it('searches by city name', async () => {
      expect((await getCities({ searchTerm: 'San Francisco' })).cities[0].name).toEqual('San Francisco');
    });

    it('searches case insensitive', async () => {
      expect((await getCities({ searchTerm: 'london' })).cities[0].name).toEqual('London');
    });

    it('searches by country name', async () => {
      expect((await getCities({ searchTerm: 'Malta' })).cities.length).toEqual(68);
    });

    it('throws an error when searching for \'error\'', async () => {
      await expect(getCities({ searchTerm: 'error' }))
        .rejects
        .toThrow('Something terrible just happened!');
    });
  });

  describe('sort', () => {
    it('sorts by one key ascending', async () => {
      expect((await getCities({ searchTerm: 'canada', sortMethod: [{ key: 'name', direction: 'ascending' }] })).cities[0].name).toEqual('Winnipeg');
    });
    it('sorts by one key descending', async () => {
      expect((await getCities({ searchTerm: 'canada', sortMethod: [{ key: 'name', direction: 'descending' }] })).cities[0].name).toEqual('Abbotsford');
    });
    it('sorts by multiple keys', async () => {
      // Sort by city name and offset to get London, Canada and London, UK.
      expect((await getCities({ offset: 4951, limit: 2, sortMethod: [{ key: 'name', direction: 'ascending' }, { key: 'population', direction: 'descending' }] })).cities[0].population).toEqual(11120000)
      expect((await getCities({ offset: 4951, limit: 2, sortMethod: [{ key: 'name', direction: 'ascending' }, { key: 'population', direction: 'descending' }] })).cities[1].population).toEqual(383822)

    });
  })
});
