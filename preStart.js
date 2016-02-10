'use strict'

const fs = require('fs');



if (!fs.existsSync('./files')) fs.mkdirSync('./files');

for (let i=0;i<100;i++) fs.writeFile("./files/file" + i + ".txt", "number" + i + "");