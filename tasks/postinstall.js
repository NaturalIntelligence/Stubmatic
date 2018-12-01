//Display message after instalation


var package = require(require('path').resolve('./package.json'));

const stars = '\x1B[1m***\x1B[0m';
const yellow = "\033[1;33m";
const light_green = "\033[1;32m";
const light_blue = "\033[1;34m";
const NC="\033[0m"; // No Color

console.log(yellow+"              Donating to an open source project is more affordable"+NC);

console.log('');
console.log('                  ' + stars + ' Thank you for using stubmatic! ' + stars);
console.log('');
console.log('             Please consider donating to help us maintain this package');
console.log('');
console.log( light_blue + '                   https://www.patreon.com/bePatron?u=9531404' + NC);
console.log('                                      or');
console.log( light_blue + '   https://www.paypal.me/amitkumarguptagwl' + NC);
console.log('');
console.log('                                     ' + stars);

console.log('');
console.log('');

console.log('Give us a \x1B[1m*\x1B[0m on '+ light_blue + 'https://github.com/NaturalIntelligence/Stubmatic'+ NC +' and help us to grow');
console.log('');
process.exit(0);