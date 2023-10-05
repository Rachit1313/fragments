const {
  listFragments,
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
} = require('../../../fragments/src/model/data/memory/index.js');

const fragmentObject = {
  ownerId: 'testOwner',
  id: 'testId',
  data: 'test data',
};

describe('Memory DB functions', () => {
  beforeEach(() => {
    //Clearing the database before each test
  });

  //test for read and write function
  test('testing writeFragment and readFragment functions', async () => {
    await writeFragment(fragmentObject);
    const retrievedFragment = await readFragment(fragmentObject.ownerId, fragmentObject.id);
    expect(retrievedFragment).toEqual(fragmentObject);
  });

  //Test case for readFragmentData and writeFragmentData
  test('testing readFragmentData and writeFragmentData functions', async () => {
    const data = Buffer.from('test Data');
    await writeFragmentData(fragmentObject.ownerId, fragmentObject.id, data);
    const result = await readFragmentData(fragmentObject.ownerId, fragmentObject.id);
    expect(result).toEqual(data);
  });

  test('testing list fragments', async () => {
    await writeFragment(fragmentObject);
    const fragmentObject2 = { ownerId: 'testOwner', id: 'testId2', data: 'test data 2' };
    await writeFragment(fragmentObject2);
    const fragments = await listFragments(fragmentObject.ownerId);
    expect(fragments).toContain(fragmentObject2.id);
    expect(fragments).toContain(fragmentObject.id);
  });

  test('deleteFragment', async () => {
    await writeFragment(fragmentObject);
    await writeFragmentData(fragmentObject.ownerId, fragmentObject.id, Buffer.from('Some data'));
    const result = await deleteFragment(fragmentObject.ownerId, fragmentObject.id);
    expect(result).toEqual([undefined, undefined]);
  });
});
