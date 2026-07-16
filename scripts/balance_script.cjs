const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/constants/gameData.js');
let data = fs.readFileSync(filePath, 'utf-8');

// Increase baseHp by 20%
data = data.replace(/baseHp:\s*(\d+)/g, (match, hp) => {
    return `baseHp: ${Math.floor(parseInt(hp) * 1.25)}`;
});

// Decrease value by 10%
data = data.replace(/value:\s*(\d+)/g, (match, val) => {
    return `value: ${Math.ceil(parseInt(val) * 0.9)}`;
});

fs.writeFileSync(filePath, data, 'utf-8');
console.log("Balanced baseHp (+25%) and attack values (-10%) in gameData.js");
