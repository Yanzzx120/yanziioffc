// Membuat nilai variabel PRICES & VOUCHERS untuk worker/order.js dari js/config.js
// Pakai:  node worker/make-prices.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { window: {}, document: { createElement() { return {}; } }, navigator: { userAgent: '' }, sessionStorage: { getItem() { return null; } }, location: {} };
vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/config.js'), 'utf8'), ctx);
const S = ctx.window.SHOP, prices = {}; S.products.forEach(p => prices[p.id] = p.price);
console.log('PRICES =\n' + JSON.stringify(prices) + '\n\nVOUCHERS =\n' + JSON.stringify(S.vouchers || {}));
