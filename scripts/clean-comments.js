const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const generate = require('@babel/generator').default;

const rootDir = path.resolve(__dirname, '..');
const targetDirs = [
    path.join(rootDir, 'backend', 'src'),
    path.join(rootDir, 'frontend', 'src')
];

function removeComments(code, filename) {
    try {
        const isTypeScript = filename.endsWith('.ts') || filename.endsWith('.tsx');
        const isJsx = filename.endsWith('.tsx') || filename.endsWith('.jsx');

        const plugins = [];
        if (isJsx) plugins.push("jsx");
        if (isTypeScript) plugins.push("typescript");
        plugins.push("decorators-legacy");

        const ast = parser.parse(code, {
            sourceType: "module",
            plugins: plugins
        });
        
        // Disable generating comments
        const output = generate(ast, {
            comments: false,
            retainLines: true, // Keep original line numbers roughly intact
        }, code);
        
        return output.code;
    } catch (e) {
        console.error(`Error parsing code with Babel in ${filename}:`, e.message);
        return code; // Return original if parsing fails
    }
}

function processDirectory(directory) {
    if (!fs.existsSync(directory)) {
        console.log(`Directory not found: ${directory}`);
        return;
    }

    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js'))) {
            // Skip .d.ts files if you want
            if (file.endsWith('.d.ts')) continue;

            const content = fs.readFileSync(fullPath, 'utf8');
            const newContent = removeComments(content, fullPath);

            // Babel's retainLines can sometimes leave extra empty lines where comments were.
            // We can optionally clean up multiple consecutive empty lines here, but retainLines is usually enough
            let finalContent = newContent.replace(/^\s*[\r\n]/gm, ''); // removing empty line 

            if (content !== finalContent) {
                 // Compare without whitespace differences to see if ONLY blank lines changed. If we only stripped blank lines this isn't worth logging as "Cleaned comment"
                 // actually, we might want to log it to show progress anyway
                 
                 // ensure we don't accidentally write broken code if babel output differs wildly from input
                 if (finalContent.length < content.length * 0.1 && content.length > 100) {
                     console.error(`Safety check failed for ${fullPath}. Output is too small. Skipping.`);
                     continue;
                 }

                fs.writeFileSync(fullPath, finalContent, 'utf8');
                console.log(`Cleaned: ${fullPath}`);
            }
        }
    }
}

console.log('Starting comment cleanup (using Babel AST)...');
targetDirs.forEach(dir => processDirectory(dir));
console.log('Comment cleanup complete!');
