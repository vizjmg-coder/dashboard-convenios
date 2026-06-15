const XLSX = require('xlsx');
const fs = require('fs');

const buf = fs.readFileSync('./data/convenios.xlsx');
const wb = XLSX.read(buf, { type: 'buffer' });
const ws = wb.Sheets[wb.SheetNames[0]];
const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

// Encontrar columnas que contienen 'supervisor'
const keys = Object.keys(json[0] || {});
const supKeys = keys.filter(k => k.toLowerCase().includes('super'));
console.log('=== COLUMNAS CON SUPERVISOR ===');
console.log(JSON.stringify(supKeys, null, 2));

// Extraer todos los supervisores únicos
const supCol = supKeys[0] || 'SUPERVISOR';
const vals = [...new Set(json.map(r => String(r[supCol] || '').trim()).filter(Boolean))].sort();
console.log('\n=== SUPERVISORES ÚNICOS EN LA BD ===');
vals.forEach(v => console.log(' -', v));

// Buscar específicamente a Jonathan Marin
console.log('\n=== FILAS CON JONATHAN O MARIN ===');
const jonathanRows = json.filter(r => {
    const sup = String(r[supCol] || '').toUpperCase();
    return sup.includes('JONATHAN') || sup.includes('MARIN') || sup.includes('GALLEGO') || sup.includes('JMARINGA');
});
jonathanRows.forEach(r => {
    console.log('  Convenio:', r['CONVENIO'], '| Supervisor:', r[supCol]);
});
console.log('Total filas encontradas:', jonathanRows.length);

// También revisar todas las columnas del primer registro
console.log('\n=== TODAS LAS COLUMNAS DEL EXCEL ===');
keys.forEach(k => console.log(' -', JSON.stringify(k)));
