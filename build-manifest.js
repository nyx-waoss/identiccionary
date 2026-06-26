// build-manifest.js
const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, 'articles');
const folders = fs.readdirSync(articlesDir);

const manifest = folders
    .filter(folder => fs.statSync(path.join(articlesDir, folder)).isDirectory())
    .map(folder => {
        const dataPath = path.join(articlesDir, folder, 'data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        return {
            id: folder,
            title: data.title,
            asideinfo: data.asideinfo,
            mainimg: data.mainimg || '',
            tags: data.tags || []
        };
    });

fs.writeFileSync(
    path.join(__dirname, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
);

console.log(`Manifest generado con ${manifest.length} artículos.`);