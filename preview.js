const ejs = require('ejs');
const { writeFileSync } = require('fs');
const { join } = require('path');

const templatePath = join(
  __dirname,
  'src',
  'email/templates',
  'order-received.ejs',
);

const data = {
  customerName: 'Jane Doe',
  vendorName: 'Emea',
  orderId: 120,
  items: [
    {
      name: 'Burger',
      quantity: 1,
      total: 1500,
      customizations: {
        variants: { name: 'Medium' },
        extras: [{ name: 'Fries', count: 1, total: 500 }],
      },
    },
  ],
  totalAmount: 2000,
  year: new Date().getFullYear(),
};

ejs.renderFile(templatePath, data, (err, str) => {
  if (err) throw err;
  writeFileSync('preview.html', str, 'utf8');
  console.log('✅ Preview generated: open preview.html in your browser');
});
