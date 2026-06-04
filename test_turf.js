const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync('assets/mapas/antioquia_municipios.geojson', 'utf8'));
const features = data.features;
console.log('Features:', features.length);
