/**
 * Script to split distributions.ts into smaller JSON files by group
 * This reduces initial bundle size by allowing lazy loading of distribution data
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read the distributions.ts file
const distributionsPath = join(rootDir, 'data', 'distributions.ts');
const content = readFileSync(distributionsPath, 'utf-8');

// Extract the data array using regex
const match = content.match(/export const distributionsData: Distribution\[\] = (\[[\s\S]*\]);/);
if (!match) {
  console.error('Failed to extract distributions data');
  process.exit(1);
}

// Parse the array (convert TS to JSON-compatible format)
// This is a simple approach - evaluate the code
const dataString = match[1];
const distributionsData = eval(dataString);

console.log(`Found ${distributionsData.length} distributions`);

// Create index with minimal data
const index = distributionsData.map((d) => ({
  id: d.id,
  name: d.name,
  title: d.title,
  group: d.group,
}));

// Group distributions by group number
const groups = {};
distributionsData.forEach((dist) => {
  if (!groups[dist.group]) {
    groups[dist.group] = [];
  }
  groups[dist.group].push(dist);
});

// Create output directory
const outputDir = join(rootDir, 'data', 'distributions');
mkdirSync(outputDir, { recursive: true });

// Write index file
writeFileSync(join(outputDir, 'index.json'), JSON.stringify(index, null, 2), 'utf-8');
console.log(`✓ Created index.json with ${index.length} entries`);

// Write group files
Object.keys(groups).forEach((groupNum) => {
  const groupData = groups[groupNum];
  writeFileSync(
    join(outputDir, `group-${groupNum}.json`),
    JSON.stringify(groupData, null, 2),
    'utf-8',
  );
  console.log(`✓ Created group-${groupNum}.json with ${groupData.length} distributions`);
});

console.log('\n✅ Distribution data split successfully!');
console.log(`\nFile sizes:`);
console.log(`- index.json: ~${Math.round(JSON.stringify(index).length / 1024)}KB`);
Object.keys(groups).forEach((groupNum) => {
  const size = Math.round(JSON.stringify(groups[groupNum]).length / 1024);
  console.log(`- group-${groupNum}.json: ~${size}KB`);
});
