/**
 * One-time seed script — populates the Supabase inventory table with
 * per-unit rows for the London office kit.
 *
 * Prerequisites:
 *   1. Create a .env.local file in the project root with:
 *        SUPABASE_URL=https://your-project-ref.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *   2. Run the DB migration SQL (see DEPLOY.md) to add region/unit_number/serial_number columns
 *   3. Delete any existing inventory rows in Supabase first
 *
 * Run once with:
 *   node scripts/seed.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Load .env.local manually (no dotenv dependency needed) ───────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');

try {
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    process.env[key] = val;
  }
} catch {
  console.error('✗  Could not read .env.local — see instructions at the top of this file.');
  process.exit(1);
}

const SUPABASE_URL           = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('✗  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// ── Default inventory (qty = number of physical units to create) ─────────────
const DEFAULT_INVENTORY = [
  { category: "Camera",     name: "RED Scarlet W",                 qty: 1 },
  { category: "Camera",     name: "RED Dragon-X",                  qty: 1 },
  { category: "Camera",     name: "Sony A7SIII",                   qty: 1 },
  { category: "Camera",     name: "Panasonic GH5",                 qty: 1 },
  { category: "Camera",     name: "Sony FX3",                      qty: 1 },
  { category: "Camera",     name: "JVC GR-DVL765EG",               qty: 1 },
  { category: "Lenses",     name: "Canon 70-200mm f/2.8 EF",      qty: 1 },
  { category: "Lenses",     name: "Sigma 18-35mm f/1.8 EF",       qty: 2 },
  { category: "Lenses",     name: "Laowa Probe Lens",              qty: 1 },
  { category: "Lenses",     name: "Samyang Fisheye",               qty: 1 },
  { category: "Lenses",     name: "XEEN 35mm Cinelens Prime",      qty: 1 },
  { category: "Lenses",     name: "Sigma 24-70mm f/2.8 E Mount",  qty: 2 },
  { category: "Lenses",     name: "Tamron 70-180mm f/2.8 E Mount",qty: 1 },
  { category: "Lenses",     name: "Sigma 30mm f/2.8 MFT",         qty: 1 },
  { category: "Lenses",     name: "Panasonic 12-35mm f/2.8 MFT",  qty: 1 },
  { category: "Lenses",     name: "Panasonic 14mm f/2.8 MFT",     qty: 1 },
  { category: "Adapters",   name: "Metabones EF-E Mount T",        qty: 1 },
  { category: "Adapters",   name: "Metabones EF-MFT Mount T",      qty: 1 },
  { category: "Adapters",   name: "Sigma MC-11 EF-E",              qty: 1 },
  { category: "Filters",    name: "Gobe Variable ND 82mm",         qty: 4 },
  { category: "Filters",    name: "PrismFX Kaleidoscope",          qty: 1 },
  { category: "Filters",    name: "Tiffen Circular Polarizer 82mm",qty: 1 },
  { category: "Filters",    name: "Tiffen Black Pro Mist 82mm",    qty: 2 },
  { category: "Action Cam", name: "GoPro Hero 11",                 qty: 2 },
  { category: "Action Cam", name: "GoPro Hero 9",                  qty: 1 },
  { category: "Action Cam", name: "Insta360 One X2",               qty: 1 },
  { category: "Audio",      name: "Rode NTG-II Shotgun Mic",       qty: 2 },
  { category: "Audio",      name: "Rode Wireless GO II",           qty: 2 },
  { category: "Audio",      name: "Sennheiser MKH416",             qty: 1 },
  { category: "Audio",      name: "Zoom H6 Recorder",              qty: 1 },
  { category: "Audio",      name: "Sound Devices MixPre-3 II",     qty: 1 },
  { category: "Audio",      name: "Sanken CS-3e Shotgun",          qty: 1 },
  { category: "Lighting",   name: "Aputure LS 600C Pro II",        qty: 1 },
  { category: "Lighting",   name: "Aputure LS 600x Pro",           qty: 1 },
  { category: "Lighting",   name: "Aputure LS 300x",               qty: 2 },
  { category: "Lighting",   name: "Aputure LS 60x",                qty: 4 },
  { category: "Lighting",   name: "Aputure MC RGBWW",              qty: 6 },
  { category: "Lighting",   name: "Quasar Science Rainbow 2",      qty: 4 },
  { category: "Lighting",   name: "Nanlite Pavotube II 15C",       qty: 4 },
  { category: "Modifiers",  name: "Aputure Light Dome II",         qty: 1 },
  { category: "Modifiers",  name: "Aputure Light Dome Mini II",    qty: 2 },
  { category: "Modifiers",  name: "Aputure Fresnel 2X",            qty: 1 },
  { category: "Modifiers",  name: "Chimera Video Pro Plus L",      qty: 1 },
  { category: "Modifiers",  name: "DedoLight DLED4 Softbox",       qty: 1 },
  { category: "Modifiers",  name: "12x12 Butterfly Frame + Grid",  qty: 1 },
  { category: "Modifiers",  name: "6x6 Floppy + Neg Fill",         qty: 2 },
  { category: "Monitoring", name: "SmallHD 702 Touch",             qty: 1 },
  { category: "Monitoring", name: "SmallHD 503 UltraBrite",        qty: 1 },
  { category: "Monitoring", name: "TVLogic LVM-074W",              qty: 1 },
  { category: "Monitoring", name: "Blackmagic Video Assist 12G",   qty: 2 },
  { category: "Drones",     name: "DJI Inspire 2",                 qty: 1 },
  { category: "Drones",     name: "DJI Mavic 3 Cine",             qty: 1 },
  { category: "Drones",     name: "DJI Mini 3 Pro",               qty: 1 },
  { category: "Support",    name: "Sachtler Aktiv8 Flowtech",      qty: 1 },
  { category: "Support",    name: "Manfrotto 504HD Tripod",        qty: 2 },
  { category: "Support",    name: "Manfrotto 561BHDV-1 Monopod",   qty: 1 },
  { category: "Support",    name: "DJI RS3 Pro Gimbal",            qty: 1 },
  { category: "Support",    name: "DJI RS2 Gimbal",                qty: 1 },
  { category: "Support",    name: "Tilta Nucleus-M Follow Focus",  qty: 1 },
  { category: "Support",    name: "Wooden Camera A-Box",           qty: 1 },
  { category: "Support",    name: "ARRI MB-20 Matte Box",          qty: 1 },
  { category: "Support",    name: "Ronin-S Gimbal",                qty: 1 },
  { category: "Support",    name: "Dana Dolly",                    qty: 1 },
  { category: "Support",    name: "Slider 1m Carbon",              qty: 2 },
  { category: "Support",    name: "Aputure LS 600 Pole",           qty: 2 },
  { category: "Support",    name: "C-Stand 40\" Chrome",            qty: 8 },
  { category: "Support",    name: "Combo Stand 20\"",               qty: 4 },
  { category: "Support",    name: "Sandbags 15lb",                  qty: 12 },
  { category: "Support",    name: "Grip Head + Arm Kit",            qty: 6 },
  { category: "Support",    name: "Magic Arm + Super Clamp",        qty: 4 },
  { category: "Support",    name: "Pelican 1650 Case",              qty: 3 },
  { category: "Support",    name: "Pelican 1510 Carry-on",          qty: 2 },
  { category: "Support",    name: "Pelican 1200 Small Case",        qty: 6 },
  { category: "Support",    name: "Cable Ties + Gaffer Tape Kit",   qty: 5 },
  { category: "Support",    name: "Teleprompter",                   qty: 1 },
];

/**
 * Expands a qty-based inventory list into one row per physical unit.
 * Items with qty=1 get unit_number=1; items with qty=N get unit_numbers 1..N.
 */
function expand(items, region) {
  return items.flatMap(({ category, name, qty }) =>
    Array.from({ length: qty }, (_, i) => ({
      category,
      name,
      region,
      unit_number: i + 1,
      serial_number: null,
    }))
  );
}

// ── Seed ─────────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  const rows = expand(DEFAULT_INVENTORY, 'London');
  console.log(`Seeding ${rows.length} unit rows for London…`);

  // Check if inventory already has data
  const { count } = await supabase
    .from('inventory')
    .select('*', { count: 'exact', head: true });

  if (count > 0) {
    console.log(`⚠  inventory table already has ${count} rows. Skipping seed.`);
    console.log('   Run the DELETE FROM inventory SQL in Supabase first if you want to re-seed.');
    process.exit(0);
  }

  const { error } = await supabase.from('inventory').insert(rows);

  if (error) {
    console.error('✗  Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`✓  Seeded ${rows.length} unit rows successfully (London office).`);
  console.log('   Dubai inventory can be added via Manage Inventory in the app.');
}

seed();
