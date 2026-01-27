const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const targetDirs = [
    path.join(rootDir, 'backend', 'src'),
    path.join(rootDir, 'frontend', 'src')
];

// Helper to remove comments safely
function removeComments(code) {
    let output = '';
    let i = 0;
    let state = 'code'; // code, string_double, string_single, string_backtick, block_comment, line_comment

    while (i < code.length) {
        const char = code[i];
        const nextChar = code[i + 1] || '';
        const prevChar = i > 0 ? code[i - 1] : '';

        if (state === 'code') {
            if (char === '"') {
                state = 'string_double';
                output += char;
            } else if (char === "'") {
                state = 'string_single';
                output += char;
            } else if (char === '`') {
                state = 'string_backtick';
                output += char;
            } else if (char === '/' && nextChar === '*') {
                state = 'block_comment';
                i++; // Skip *
            } else if (char === '/' && nextChar === '/') {
                state = 'line_comment';
                i++; // Skip /
            } else {
                output += char;
            }
        } else if (state === 'string_double') {
            output += char;
            // Check for unnecessary escapes is complex, but simple version:
            if (char === '"' && prevChar !== '\\') state = 'code';
        } else if (state === 'string_single') {
            output += char;
            if (char === "'" && prevChar !== '\\') state = 'code';
        } else if (state === 'string_backtick') {
            output += char;
            if (char === '`' && prevChar !== '\\') state = 'code';
        } else if (state === 'block_comment') {
            if (char === '*' && nextChar === '/') {
                state = 'code';
                i++; // Skip /
            }
        } else if (state === 'line_comment') {
            if (char === '\n') {
                state = 'code';
                output += char; // Keep the newline
            }
        }
        i++;
    }
    return output;
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
            const newContent = removeComments(content);

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Cleaned: ${fullPath}`);
            }
        }
    }
}

console.log('Starting comment cleanup...');
targetDirs.forEach(dir => processDirectory(dir));
console.log('Comment cleanup complete!');
