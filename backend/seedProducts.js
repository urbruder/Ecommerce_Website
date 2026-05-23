/**
 * seedProducts.js
 * ─────────────────────────────────────────────────────────────
 * Automation script to bulk-seed all 52 products from assets.js
 * into the database via the existing backend API.
 *
 * Usage:  node seedProducts.js
 *
 * What it does:
 *   1. Logs in as admin → gets JWT token
 *   2. For each product in the assets list:
 *      a. Uploads images (from frontend/src/assets/) as multipart form data
 *      b. Sends product metadata (name, description, price, etc.)
 *      c. Hits POST /api/product/add (same endpoint the admin panel uses)
 *   3. Logs progress with a summary at the end
 * ─────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Configuration ──────────────────────────────────────────────
const BACKEND_URL = `http://localhost:${process.env.PORT || 4000}`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ASSETS_DIR = path.resolve(__dirname, '..', 'frontend', 'src', 'assets');

// ── Product definitions (mirroring assets.js) ──────────────────
// Maps each product's image references to actual filenames in the assets folder.
const products = [
  {
    name: "Women Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 100,
    images: ["p_img1.png"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L"],
    bestseller: false
  },
  {
    name: "Men Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 200,
    images: ["p_img2_1.png", "p_img2_2.png", "p_img2_3.png", "p_img2_4.png"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Girls Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 220,
    images: ["p_img3.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "L", "XL"],
    bestseller: true
  },
  {
    name: "Men Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 110,
    images: ["p_img4.png"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "XXL"],
    bestseller: true
  },
  {
    name: "Women Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 130,
    images: ["p_img5.png"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["M", "L", "XL"],
    bestseller: true
  },
  {
    name: "Girls Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 140,
    images: ["p_img6.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "L", "XL"],
    bestseller: true
  },
  {
    name: "Men Tapered Fit Flat-Front Trousers",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 190,
    images: ["p_img7.png"],
    category: "Men",
    subCategory: "Bottomwear",
    sizes: ["S", "L", "XL"],
    bestseller: true
  },
  {
    name: "Men Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 140,
    images: ["p_img8.png"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Girls Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 100,
    images: ["p_img9.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Tapered Fit Flat-Front Trousers",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 110,
    images: ["p_img10.png"],
    category: "Men",
    subCategory: "Bottomwear",
    sizes: ["S", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 120,
    images: ["p_img11.png"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L"],
    bestseller: false
  },
  {
    name: "Men Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 150,
    images: ["p_img12.png"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Women Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 130,
    images: ["p_img13.png"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Boy Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 160,
    images: ["p_img14.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Tapered Fit Flat-Front Trousers",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 140,
    images: ["p_img15.png"],
    category: "Men",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Girls Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 170,
    images: ["p_img16.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Tapered Fit Flat-Front Trousers",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 150,
    images: ["p_img17.png"],
    category: "Men",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Boy Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 180,
    images: ["p_img18.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Boy Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 160,
    images: ["p_img19.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Women Palazzo Pants with Waist Belt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 190,
    images: ["p_img20.png"],
    category: "Women",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Women Zip-Front Relaxed Fit Jacket",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 170,
    images: ["p_img21.png"],
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Women Palazzo Pants with Waist Belt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 200,
    images: ["p_img22.png"],
    category: "Women",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Boy Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 180,
    images: ["p_img23.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Boy Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 210,
    images: ["p_img24.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Girls Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 190,
    images: ["p_img25.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Women Zip-Front Relaxed Fit Jacket",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 220,
    images: ["p_img26.png"],
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Girls Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 200,
    images: ["p_img27.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Slim Fit Relaxed Denim Jacket",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 230,
    images: ["p_img28.png"],
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Women Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 210,
    images: ["p_img29.png"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Girls Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 240,
    images: ["p_img30.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 220,
    images: ["p_img31.png"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 250,
    images: ["p_img32.png"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Girls Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 230,
    images: ["p_img33.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Women Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 260,
    images: ["p_img34.png"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Women Zip-Front Relaxed Fit Jacket",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 240,
    images: ["p_img35.png"],
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Women Zip-Front Relaxed Fit Jacket",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 270,
    images: ["p_img36.png"],
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Women Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 250,
    images: ["p_img37.png"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 280,
    images: ["p_img38.png"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Printed Plain Cotton Shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 260,
    images: ["p_img39.png"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Slim Fit Relaxed Denim Jacket",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 290,
    images: ["p_img40.png"],
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 270,
    images: ["p_img41.png"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Boy Round Neck Pure Cotton T-shirt",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 300,
    images: ["p_img42.png"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Kid Tapered Slim Fit Trouser",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 280,
    images: ["p_img43.png"],
    category: "Kids",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Women Zip-Front Relaxed Fit Jacket",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 310,
    images: ["p_img44.png"],
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Slim Fit Relaxed Denim Jacket",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 290,
    images: ["p_img45.png"],
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Slim Fit Relaxed Denim Jacket",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 320,
    images: ["p_img46.png"],
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Kid Tapered Slim Fit Trouser",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 300,
    images: ["p_img47.png"],
    category: "Kids",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Slim Fit Relaxed Denim Jacket",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 330,
    images: ["p_img48.png"],
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Kid Tapered Slim Fit Trouser",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 310,
    images: ["p_img49.png"],
    category: "Kids",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Kid Tapered Slim Fit Trouser",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 340,
    images: ["p_img50.png"],
    category: "Kids",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Women Zip-Front Relaxed Fit Jacket",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 320,
    images: ["p_img51.png"],
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
  {
    name: "Men Slim Fit Relaxed Denim Jacket",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 350,
    images: ["p_img52.png"],
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false
  },
];

// ── Helper: Admin Login ────────────────────────────────────────
async function getAdminToken() {
  console.log('🔑 Logging in as admin...');
  const res = await fetch(`${BACKEND_URL}/api/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Admin login failed: ${data.message}`);
  }
  console.log('✅ Admin login successful\n');
  return data.token;
}

// ── Helper: Upload a single product ────────────────────────────
async function uploadProduct(product, index, token) {
  const formData = new FormData();

  // Append text fields
  formData.append('name', product.name);
  formData.append('description', product.description);
  formData.append('price', String(product.price));
  formData.append('category', product.category);
  formData.append('subCategory', product.subCategory);
  formData.append('sizes', JSON.stringify(product.sizes));
  formData.append('bestseller', String(product.bestseller));

  // Append image files (up to 4, matching the multer field names)
  for (let i = 0; i < product.images.length && i < 4; i++) {
    const imgFilename = product.images[i];
    const imgPath = path.join(ASSETS_DIR, imgFilename);

    if (!fs.existsSync(imgPath)) {
      console.error(`   ⚠️  Image not found: ${imgPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(imgPath);
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    formData.append(`image${i + 1}`, blob, imgFilename);
  }

  const res = await fetch(`${BACKEND_URL}/api/product/add`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  return data;
}

// ── Main Execution ─────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  🚀 Product Seeder - Bulk Upload Automation');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Products to upload : ${products.length}`);
  console.log(`  Assets directory   : ${ASSETS_DIR}`);
  console.log(`  Backend URL        : ${BACKEND_URL}`);
  console.log('═══════════════════════════════════════════════════\n');

  // Step 1: Get admin token
  const token = await getAdminToken();

  // Step 2: Upload each product
  let successCount = 0;
  let failCount = 0;
  const failed = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const label = `[${i + 1}/${products.length}]`;

    process.stdout.write(`${label} Uploading "${product.name}" (₹${product.price}) ... `);

    try {
      const result = await uploadProduct(product, i, token);
      if (result.success) {
        console.log('✅ Done');
        successCount++;
      } else {
        console.log(`❌ Failed: ${result.message}`);
        failCount++;
        failed.push({ index: i + 1, name: product.name, reason: result.message });
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      failCount++;
      failed.push({ index: i + 1, name: product.name, reason: err.message });
    }
  }

  // Step 3: Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  📊 Upload Summary');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  ✅ Successful : ${successCount}`);
  console.log(`  ❌ Failed     : ${failCount}`);
  console.log(`  📦 Total      : ${products.length}`);

  if (failed.length > 0) {
    console.log('\n  Failed products:');
    failed.forEach(f => {
      console.log(`    #${f.index} "${f.name}" — ${f.reason}`);
    });
  }

  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
