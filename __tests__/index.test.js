// __tests__/index.test.js

const { updateSingleMarkdownFile } = require('../index');
const fs = require('fs-extra');
const path = require('path');

describe('updateSingleMarkdownFile', () => {
  it('should update markdown file correctly', async () => {
    const markdownFilePath = 'test.md';
    const imageDir = './images';
    const destDir = './dest';
    
    // Create a test markdown file
    const content = `# Test File\n\n![[]](./images/test.png)`;
    await fs.writeFile(markdownFilePath, content);

    // Run the function to be tested
    await updateSingleMarkdownFile(markdownFilePath, imageDir, destDir);

    // Check if the markdown file is updated correctly
    const updatedContent = await fs.readFile(path.join(destDir, 'test.md'), 'utf8');
    expect(updatedContent).toContain('![[]](./images/test.png)');

    // Clean up test files
    await fs.unlink(markdownFilePath);
    await fs.unlink(path.join(destDir, 'test.md'));
  });
});
