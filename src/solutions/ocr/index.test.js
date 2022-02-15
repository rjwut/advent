const ocr = require('.');

const TEST_CASES = [
  { // normal case
    input: ` ##   ##   ## 
#  # #  # #  #
#  # #  # #   
#### #  # #   
#  # #  # #  #
#  #  ##   ## `,
    output: 'AOC',
  },
  { // max width glyph not followed by blank column
    input: `#   # .##
#   #   #
 # #    #
  #     #
  #  #  #
  #   ## `,
    output: 'YJ',
  },
  { // unknown glyph
    input: ` ##   ##   ## 
#  # #  # #  #
## # #  # #   
# ## #  # #   
#  # #  # #  #
#  #  ##   ## `,
    output: '?OC',
  },
  { // I/O error
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
