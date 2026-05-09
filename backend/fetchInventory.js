const fetch = require('node-fetch');

async function fetchInventory() {
  try {
    const response = await fetch('http://localhost:5000/api/inventory/1');
    const inventory = await response.json();
    
    console.log('=== INVENTORY LIST ===');
    console.log(`Total items: ${inventory.length}\n`);
    
    inventory.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
      console.log(`  Medicine ID: ${item.medicine_id}`);
      console.log(`  Generic Name: ${item.generic_name}`);
      console.log(`  Brand Name: ${item.brand_name}`);
      console.log(`  Stock ID: ${item.stock_id}`);
      console.log(`  Quantity: ${item.quantity}`);
      console.log(`  Expiry: ${item.expiry_date}`);
      console.log(`  Category: ${item.category}`);
      console.log(`  Strength: ${item.strength}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error fetching inventory:', error.message);
  }
}

fetchInventory();
