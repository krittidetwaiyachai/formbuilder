const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/responses`;
const FORM_API_URL = `${BASE_URL}/api/forms`;

const args = process.argv.slice(2);
const TARGET_FORM_ID = args[0] || 'REPLACE_WITH_FORM_ID';
const TOTAL_REQUESTS = parseInt(args[1]) || 100;
const CONCURRENCY = parseInt(args[2]) || 10;

if (TARGET_FORM_ID === 'REPLACE_WITH_FORM_ID') {
    console.error('❌ Error: Please provide a Form ID.');
    console.log('Usage: node load-test.js <FORM_ID> [TOTAL_REQUESTS=100] [CONCURRENCY=10]');
    process.exit(1);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateDummyData(field) {
    switch (field.type) {
        case 'TEXT':
        case 'SHORT_TEXT':
            return `Test Text ${generateRandomString(5)}`;
        case 'TEXTAREA':
        case 'LONG_TEXT':
            return `This is a long test response ${generateRandomString(20)}`;
        case 'EMAIL':
            return `testuser_${generateRandomString(5)}@example.com`;
        case 'NUMBER':
            return getRandomInt(1, 100).toString();
        case 'RATE':
        case 'RATING':
            return getRandomInt(1, 5).toString();
        case 'SCALE':
            return getRandomInt(0, 10).toString();
        case 'DATE':
            return new Date().toISOString().split('T')[0];
        case 'TIME':
            return '12:00';
        case 'SELECT':
        case 'DROPDOWN':
        case 'RADIO':
        case 'MULTIPLE_CHOICE':
            if (field.options) {
                let options = field.options;
                if (typeof options === 'string') {
                    try { options = JSON.parse(options); } catch (e) {}
                }
                const items = options.items || options;
                if (Array.isArray(items) && items.length > 0) {
                     const randomItem = getRandomElement(items);
                     return randomItem.value || randomItem.label || randomItem;
                }
            }
            return 'Option 1'; 
        case 'CHECKBOX':
             if (field.options) {
                let options = field.options;
                if (typeof options === 'string') {
                    try { options = JSON.parse(options); } catch (e) {}
                }
                const items = options.items || options;
                if (Array.isArray(items) && items.length > 0) {
                     const randomItem = getRandomElement(items);
                     return randomItem.value || randomItem.label || randomItem;
                }
            }
            return 'Checkbox 1';
        case 'boolean':
            return 'true';
        default:
            return `Default Value ${generateRandomString(5)}`;
    }
}

async function fetchFormDefinition(formId) {
    try {
        console.log(`🔍 Fetching definition for Form ID: ${formId}...`);
        const url = `${FORM_API_URL}/${formId}/public`;
        const response = await axios.get(url);
        return response.data.form;
    } catch (error) {
        console.error(`❌ Failed to fetch form: ${error.message}`);
        if(error.response) console.error(error.response.data);
        process.exit(1);
    }
}

async function runLoadTest() {
    console.log(`\n🚀 STARTING LOAD TEST`);
    console.log(`-----------------------------------`);
    console.log(`Target Form: ${TARGET_FORM_ID}`);
    console.log(`Total Requests: ${TOTAL_REQUESTS}`);
    console.log(`Concurrency: ${CONCURRENCY}`);
    console.log(`-----------------------------------\n`);

    const form = await fetchFormDefinition(TARGET_FORM_ID);
    
    const submitFields = form.fields.filter(f => 
        !['HEADER', 'PARAGRAPH', 'DIVIDER', 'PAGE_BREAK', 'IMAGE', 'VIDEO'].includes(f.type)
    );

    console.log(`📝 Found ${submitFields.length} input fields.`);
    submitFields.forEach(f => console.log(`   - [${f.type}] ${f.label}`));
    console.log(`\n🔥 Firing requests...\n`);

    let completed = 0;
    let success = 0;
    let failed = 0;
    const startTime = Date.now();
    const activePromises = [];

    const sendRequest = async (index) => {
        const answers = submitFields.map(field => ({
            fieldId: field.id,
            value: generateDummyData(field)
        }));

        const payload = {
             formId: TARGET_FORM_ID,
             fingerprint: `load-test-${generateRandomString(10)}`,
             answers: answers
         };
 
         let attempt = 0;
         while (true) {
             try {
                 attempt++;
                 await axios.post(API_URL, payload);
                 success++;
                 process.stdout.write('.');
                 break;
             } catch (error) {
                 if (error.response && error.response.status === 429) {
                     process.stdout.write('!');
                     const waitTime = getRandomInt(1000, 3000);
                     await new Promise(r => setTimeout(r, waitTime));
                     continue; 
                 }
                 
                 failed++;
                 process.stdout.write('x');
                 break;
             }
         }
 
         completed++;
         if (completed % 50 === 0) process.stdout.write(` [${completed}/${TOTAL_REQUESTS}]\n`);
    };
    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        const p = sendRequest(i);
        activePromises.push(p);

        if (activePromises.length >= CONCURRENCY) {
            await Promise.all(activePromises);
            activePromises.length = 0;
        }
    }

    await Promise.all(activePromises);

    const duration = (Date.now() - startTime) / 1000;
    
    console.log(`\n\n=======================================`);
    console.log(`✅ TEST COMPLETED`);
    console.log(`=======================================`);
    console.log(`Time Taken:    ${duration.toFixed(2)}s`);
    console.log(`RPS:           ${(TOTAL_REQUESTS / duration).toFixed(2)} req/sec`);
    console.log(`Total:         ${TOTAL_REQUESTS}`);
    console.log(`Success:       ${success} (${((success/TOTAL_REQUESTS)*100).toFixed(1)}%)`);
    console.log(`Failed:        ${failed} (${((failed/TOTAL_REQUESTS)*100).toFixed(1)}%)`);
    console.log(`=======================================\n`);
}

runLoadTest();
