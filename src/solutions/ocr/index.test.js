const ocr = require('.');

const TEST_CASES = [
  {
    input: ` ##   ##   ## 
#  # #  # #  #
#  # #  # #   
#### #  # #   
#  # #  # #  #
#  #  ##   ## `,
    output: 'AOC',
  },
  {
    input: ` ##   ##   ## 
#  # #  # #  #
## # #  # #   
# ## #  # #   
#  # #  # #  #
#  #  ##   ## `,
    output: '?OC',
  },
  {
    input: 'foo',
    error: 'ENOENT',
  }
];

test.each(TEST_CASES)('OCR module', async testCase => {
  if (testCase.error) {
    await expect(() => ocr(testCase.input)).rejects.toThrow(testCase.error);
  } else {
    expect(await ocr(testCase.input)).toBe(testCase.output);
  }
});
