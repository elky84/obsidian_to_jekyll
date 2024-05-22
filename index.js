#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const jekyllMarkdownDir = process.env.JEKYLL_MARKDOWN_DIR || './jekyll/_posts';
const jekyllImageDir = process.env.JEKYLL_IMAGE_DIR || './jekyll/assets/images';

function extractImagePaths(content) {
  const regex = /\[\[([^\]]*\.(?:png|jpg|jpeg|gif))\]\]/g;
  const matches = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}


async function copyFile(srcPath, destDir) {
  await fs.ensureDir(destDir);
  const destPath = path.join(destDir, path.basename(srcPath));
  if (!await fs.pathExists(destPath)) {
    await fs.copy(srcPath, destPath);
  }
  return destPath;
}

async function updateSingleMarkdownFile(markdownFilePath, imageDir, destDir) {
  try {
      let content = await fs.readFile(markdownFilePath, 'utf8');
      
      const imagePaths = extractImagePaths(content);

      const markdownDir = path.dirname(markdownFilePath);
      const markdownFileName = path.basename(markdownFilePath, '.md');
      const imageDirPath = path.join(markdownDir, markdownFileName);

      for (const imagePath of imagePaths) {
          const srcImagePath = path.resolve(imageDirPath, imagePath);
          if (await fs.pathExists(srcImagePath)) {
              await fs.ensureDir(imageDirPath);
              const destImagePath = await copyFile(srcImagePath, imageDirPath);
              const imageFileName = path.basename(destImagePath);
              const newDestImagePath = path.join(imageDir, imageFileName);
              await fs.copy(destImagePath, newDestImagePath, { overwrite: true });
              const relativeImagePath = path.relative(destDir, newDestImagePath).replace(/\\/g, '/');
              const updatedImagePath = `![](${relativeImagePath})`;
              content = content.replace(`![[${imagePath}]]`, updatedImagePath);
          } else {
              console.warn(`not found image ${srcImagePath}`);
          }
      }

      const destPath = path.join(destDir, path.basename(markdownFilePath));
      await fs.writeFile(destPath, content, 'utf8');
      console.log(`completed file copy & update path ${destPath}`);
  } catch (err) {
      console.error(`an error occurred while copying the file ${markdownFilePath}`, err);
  }
}

module.exports = { updateSingleMarkdownFile };

async function main(markdownFilePath) {
  try {
    if (!markdownFilePath) {
      throw new Error('Markdown file path not provided.');
    }
  
    await updateSingleMarkdownFile(markdownFilePath, jekyllImageDir, jekyllMarkdownDir);
    console.log('File copy and path update complete');
  } catch (err) {
      console.error('an error occurred:', err.message);
  }
}
  
const markdownFilePath = process.argv[2];
main(markdownFilePath);
  