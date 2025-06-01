#!/usr/bin/env node

// Run this script from composy root, it will create a file in root called complete-composy.js.
// That file can be copied anywhere and imported as any other file.
import * as fs from 'fs';
import * as path from 'path';

// For now update it here, bad duplication but it's cumbersome to dynamically remove content from existing file
const composyClass = `export class Composy extends HTMLElement {
	shadowRoot;
	#composingClass;

	constructor() {
		super();
		this.shadowRoot = this.attachShadow({mode: 'open'});
		this.#composingClass = new.target;
	}

	connectedCallback() {
		this.connected();
	}

	connected() {}

	hasTrait(name) {
		Object.assign(this.#composingClass.prototype, traits[name]);
	}
}
`

const pathRegex = /^.*'(.*)?';$/;

// Parses export file paths.
// Takes the contents of a file that contains exports and extracts the export paths from it.
// Sometimes the path isn't quite right because relative exports, if so, pass in a second
// parameter with the part to add between './' and the rest of the path that was exported.
const parseExportFilePaths = (exportFileContent, prependToPath = '') => {
	const exportFiles = exportFileContent.split('\n').filter((i) => i.startsWith('export'));

	const filePaths = exportFiles.map((fi) => {
		const pathMatch = fi.match(pathRegex);
		return pathMatch[1] || "";
	}).filter(Boolean).map((fp) => {
		// We pass in directory because imports are relative, could be done in a more programmatic
		// fashion but I reckon there won't be too many of these. Otherwise reconsider.
		if (prependToPath) {
			if (fp.startsWith('./')) {
				return `./${prependToPath}/${fp.substring(2)}`;
			} else {
				return `${prependToPath}/${fp}`;
			}
		}

		return fp;
	});

	return filePaths;
}

// Returns the content of the files provided in paths
// paths: Array or string (any other will throw error)
const getContent = (paths) => {
	if (!Array.isArray(paths) && (typeof paths === 'string' || paths instanceof String)) {
		paths = [ paths ];
	} else if (!Array.isArray(paths)) {
		throw Error(`Passed neither string or array into getContent, got: ${paths}`);
	}

	const content = [];
	for (const index in paths) {
		content.push(fs.readFileSync(paths[index], 'utf8'));
	}

	return content;
}

// Returns the content from components
// Components are a bit different as they need to be assembled from multiple files.
const getComponentContent = (paths) => {
	let content = "";
	for (const p of paths) {
		const cssFilePath = p.replace('.js', '.css');
		const cssContent = fs.readFileSync(cssFilePath, 'utf8');
		const htmlFilePath = p.replace('.js', '.html');
		const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
		const shadowRootContent = `\t\tthis.shadowRoot = \`${htmlContent}\n<style>\n${cssContent}\n</style>\``;

		const component = fs.readFileSync(p, 'utf8');
		const lines = component.split('\n');
		const index = lines.findIndex((l) => l.includes('super();'));
		// add shadowRoot after super() call
		lines.splice(index + 1, 0, shadowRootContent);

		content += `${lines.join('\n')}\n`;
	}

	return content;
}

// Adds the trait content to the output file
// We must change it a bit, we no longer export them but must make them work with
// how Composy handles traits.
const addTraitsToOutput = (traits) => {
	let traitsCode = 'const traits = {};\n';
	const replaceStart = new RegExp('^export const ');
	return traits.map((trait) => trait.replace(replaceStart, 'traits.').trimEnd().concat(';')).join('\n');
}


const makeBuildDirectory = () => {
	try {
		fs.mkdirSync('build');
	} catch (e) {
		if (e.code !== 'EEXIST') throw e;
	}
}

// This is where the script starts,
// Everything above are helper functions.
const scriptPath = process.argv.find((arg) => arg.includes('/composy/'));
const scriptDirectory = path.dirname(scriptPath);
const rootDirectory = path.join(scriptDirectory, '..');

// First import everything that Composy needs (add it here manually)
const pathToTraitsImport = path.join(rootDirectory, './traits/index.js');
const traitExportFileContent = fs.readFileSync(pathToTraitsImport, 'utf8');
const traitExportPaths = parseExportFilePaths(traitExportFileContent, 'traits');

const traitCode = getContent(traitExportPaths);

let output = "";
output += addTraitsToOutput(traitCode) + '\n';

// Add compoosy base class for components, as exists in string above
output += composyClass;

// Only use the files that are exported, nothing else.
// Any valid javascript added there won't be included in build.
const imports = fs.readFileSync(`${rootDirectory}/index.js`, 'utf8');
const componentImports = imports.split('\n').filter((i) => i.startsWith('export'));
componentImports.shift();
const componentExportPaths = parseExportFilePaths(componentImports.join('\n'));

// Here we need to fetch and assemble every component, put the html and css in the class
const componentCode = getComponentContent(componentExportPaths);
output += componentCode;
console.log(output);

makeBuildDirectory();
fs.writeFile('build/composy.js', output, (err) => { if (err) throw err; });

