const dataize = require('../../../src/commands/java/dataize');
const verifyJavac = require('../../../src/verify_javac');

jest.mock('../../../src/verify_javac');

describe('dataize', () => {
  it('calls verifyJavac', () => {
    jest.spyOn(require('child_process'), 'spawn').mockImplementation(() => ({
      on: jest.fn()
    }));

    dataize('foo', [], {target: '.', stack: '64M', heap: '256M'});
    expect(verifyJavac).toHaveBeenCalled();
  });
});D
