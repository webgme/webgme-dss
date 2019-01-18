var path = require('path'),
    fs = require('fs'),
    execute = require('child_process').execSync,
    preprocess = require(path.join(__dirname, './../src/common/preprocessComponents.js')).prepComponents,
    stdoutTxt;

console.log('extracting modelica standard library information');
execute('python scripts/py_modelica_exporter/run.py');
console.log('preprocessing components');
preprocess('components.json');
console.log('creating empty project');
stdoutTxt = execute('node node_modules/webgme-engine/src/bin/import.js -w  -p ModelicaBase src/seeds/Modelica/ModelicaBaseSeed.webgmex', {encoding: 'utf8'});
console.log(stdoutTxt);
console.log('creating seed');
fs.writeFileSync('seedcreator.json', '{"updateBranch": true}', 'utf8');
stdoutTxt = execute('node node_modules/webgme-engine/src/bin/run_plugin SeedCreator ModelicaBase -j seedcreator.json', {encoding: 'utf8'});
console.log(stdoutTxt);
console.log('generate svg cache file');
execute('node scripts/generateSVGCache.js');
console.log('adding svg info to component registries');
stdoutTxt = execute('node node_modules/webgme-engine/src/bin/run_plugin MoveSVGToRegistryUtil ModelicaBase', {encoding: 'utf8'});
console.log(stdoutTxt);
console.log('exporting seed');
stdoutTxt = execute('node node_modules/webgme-engine/src/bin/export.js --project-name ModelicaBase --out-file src/seeds/Modelica/Modelica.webgmex -s master', {encoding: 'utf8'});
console.log(stdoutTxt);
console.log('next step');