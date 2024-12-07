var packagesFile = require('./package.json')
var { execSync } = require('child_process');

var allPackages = Object.assign(packagesFile.devDependencies, packagesFile.dependencies);
var allPackagesArray = Object.entries(allPackages);

for (var [pac, ver] of allPackagesArray) {
	console.log(`npm i ${pac}@${ver}`);
	if (pac === 'grunt-cli') {
		execSync(`npm i -g ${pac}@${ver}`);
	} else {
		execSync(`npm i ${pac}@${ver}`);
	}
}

// console.log(Object.entries(allPackages));
// execSync('npm i');
