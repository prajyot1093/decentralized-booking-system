const { expect } = require('chai');

describe('CI failure sentinel', function () {
  it('intentionally fails to ensure CI test detection', async function () {
    // This test is intentionally failing so CI shows test execution.
    // Remove or change after adding real tests.
    expect(true).to.equal(false);
  });
});
