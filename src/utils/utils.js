import fs from "fs";
import path from "path";

export function createNextStorySubdirectory(storiesDir = "src/data/stories/") {
  // Make sure the Stories directory exists
  if (!fs.existsSync(storiesDir)) {
    console.log(`The directory '${storiesDir}' does not exist. Creating it...`);
    fs.mkdirSync(storiesDir);
  }

  // List all items in the Stories directory
  const items = fs.readdirSync(storiesDir);

  // Filter out items that are directories following the naming pattern 'storyX'
  const storyDirs = items.filter((item) => {
    const itemPath = path.join(storiesDir, item);
    return fs.statSync(itemPath).isDirectory() && item.startsWith("story");
  });

  // If more than 10 story directories exist, delete all of them
  const max = 3;
  if (storyDirs.length > max) {
    for (const dirName of storyDirs) {
      const dirPath = path.join(storiesDir, dirName);
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
    console.log(
      `More than ${max} story directories found. All have been deleted.`
    );
    // After deletion, the directory list is cleared, so reinitialize to avoid creating an unintended directory
    storyDirs.length = 0;
  }

  // Find the first empty directory, if any
  let emptyDirPath = null;
  for (const dirName of storyDirs) {
    const dirPath = path.join(storiesDir, dirName);
    const dirItems = fs.readdirSync(dirPath);
    if (dirItems.length === 0) {
      emptyDirPath = dirPath;
      break;
    }
  }

  if (emptyDirPath) {
    console.log(`Using existing empty directory: ${emptyDirPath}`);
    return emptyDirPath;
  }

  // Extract the numbers from the directory names and find the highest one
  let lastNum = 0;
  storyDirs.forEach((dirName) => {
    try {
      const num = parseInt(dirName.replace("story", ""));
      lastNum = Math.max(lastNum, num);
    } catch (error) {
      // Skip any directories that don't strictly follow the 'storyX' pattern
      return;
    }
  });

  // The name for the new directory
  const newDirName = `story${lastNum + 1}`;
  const newDirPath = path.join(storiesDir, newDirName);

  // Create the new directory
  fs.mkdirSync(newDirPath, { recursive: true });
  console.log(`Created new directory: ${newDirPath}`);
  return newDirPath;
}
