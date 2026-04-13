/**
 * seed-london.mjs
 * Replaces ALL inventory for the London region with the 2026 kit list.
 *
 * Usage:
 *   node seed-london.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (never commit this key).
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Load .env.local ──────────────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, '.env.local');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
    .filter(([k]) => k)
    .map(([k, ...v]) => [k, v.join('=')])
);

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceKey  = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌  Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const REGION   = 'London';

// ── Inventory data ────────────────────────────────────────────────────────────
// Helper: expand an item with qty > 1 into individual unit rows.
function units(category, name, qty, serials = []) {
  return Array.from({ length: qty }, (_, i) => ({
    category,
    name,
    unit_number:   i + 1,
    serial_number: serials[i] ?? null,
    region:        REGION,
  }));
}

const INVENTORY = [
  // ── Cameras ─────────────────────────────────────────────────────────────
  ...units('Cameras', 'RED Komodo-X',  2, ['KXZBK001390', 'KXZBK001396']),
  ...units('Cameras', 'Sony A7SIII',   1, ['3813422']),
  ...units('Cameras', 'Sony FX3',      1, ['3776514']),

  // ── Lenses ──────────────────────────────────────────────────────────────
  ...units('Lenses', 'Laowa Ranger 50-130mm Z',  1, ['000089']),
  ...units('Lenses', 'Laowa Ranger 14-50mm Z',   1, ['000090']),
  ...units('Lenses', 'Sigma 18-35mm EF',         1, ['52759329']),
  ...units('Lenses', 'Laowa Probe Lens EF',       1, ['17557']),
  ...units('Lenses', 'Samyang Fisheye EF',        1, ['EAP23743']),
  ...units('Lenses', 'Sigma 30mm MFT',            1, ['56417762']),
  ...units('Lenses', 'Sigma 70-200mm E',          1, ['58191329']),
  ...units('Lenses', 'Sigma 24-70mm E',           3, ['58442187', '56256827', '57583082']),
  ...units('Lenses', 'Tamron 70-180mm E',         1, ['91007']),
  ...units('Lenses', 'Laowa Macro 60mm E',        1, ['26673']),

  // ── Adapters ─────────────────────────────────────────────────────────────
  ...units('Adapters', 'Metabones EF-E Mount T',    1, ['A1014062016']),
  ...units('Adapters', 'Metabones EF-MFT Mount T',  1, ['3016001200']),
  ...units('Adapters', 'Megadap EF-Z',               1, ['241002']),
  ...units('Adapters', 'Megadap E-Z',                1, ['11352']),
  ...units('Adapters', 'Sigma MC-11 EF-E',           1, ['56186856']),
  ...units('Adapters', 'URTH EF-X',                  1, ['304755']),
  ...units('Adapters', 'Neewer Step Up Rings Set',   1),

  // ── Filters ──────────────────────────────────────────────────────────────
  ...units('Filters', 'Tide Variable ND 77mm',         1),
  ...units('Filters', 'Tiffen Variable ND 77mm',       1),
  ...units('Filters', 'Tiffen Variable ND 82mm',       5),
  ...units('Filters', 'Gobe CPL 77mm',                 1),
  ...units('Filters', 'Gobe Variable ND 82mm',         1),
  ...units('Filters', 'Fotonic Kaleidoscope 77mm',     1),
  ...units('Filters', 'PrismFX Split Diopter 82mm',   1),
  ...units('Filters', 'URTH Star Filters 4,6,8 77mm', 1),
  ...units('Filters', 'Tiffen Circular Polarizer 82mm', 1),
  ...units('Filters', 'Tiffen Black Pro Mist 82mm 1/8', 2),

  // ── Action Cameras ───────────────────────────────────────────────────────
  ...units('Action Cameras', 'Insta360 X5',      1, ['IAHEA2505NVFXX']),
  ...units('Action Cameras', 'Osmo Action 4',    2, ['6S6XMCM00AZ8DY', '6S6XMCL00AYYHY']),
  ...units('Action Cameras', 'Osmo Action 5 Pro',4, ['82JXN6900BAY6H', '82JXN7800E3G08']),

  // ── Monitoring ───────────────────────────────────────────────────────────
  ...units('Monitoring', 'DJI Transmission Combo',      1),
  ...units('Monitoring', 'Atomos Ninja V Black',         1),
  ...units('Monitoring', 'Atomos Ninja V Gold',          4),
  ...units('Monitoring', 'Atomos Shinobi 7',             1),
  ...units('Monitoring', 'Angelbird AtomX SSDmini 500GB',1),
  ...units('Monitoring', 'Angelbird AtomX SSDmini 1TB',  1),
  ...units('Monitoring', 'Smallrig HDMI Cable',          4),
  ...units('Monitoring', 'SDI Cable',                    2),
  ...units('Monitoring', 'DJI SDR',                      8),
  ...units('Monitoring', 'Eliminator',                   8),
  ...units('Monitoring', 'D-Tap Cable',                  6),
  ...units('Monitoring', 'TV Monitor',                   1),

  // ── Audio ────────────────────────────────────────────────────────────────
  ...units('Audio', 'Zoom H6',                    1, ['C50026221']),
  ...units('Audio', 'Zoom H8',                    1),
  ...units('Audio', 'Zoom F8N',                   1, ['C84007513']),
  ...units('Audio', 'Rode NTG-II',                4, ['BM0305112', '0266353', '0257113', 'BM0305035']),
  ...units('Audio', 'Sennheiser EW G4',           1, ['1458003183']),
  ...units('Audio', 'Rode Video Mic Pro',         1),
  ...units('Audio', 'Se Electronics Condenser Set', 1, ['X1SB007950']),
  ...units('Audio', 'Rode Lavelier II',           2),
  ...units('Audio', 'Sennheiser ME 2',            1),
  ...units('Audio', 'DJI Mic 2',                  3, ['6VSXLAQ012147L', '6VSXMCJ013C8US', '6VSXN6Q013J7WV']),
  ...units('Audio', 'Boom Pole',                  1),
  ...units('Audio', 'XLR Cable 10m',              1),
  ...units('Audio', 'XLR Cable 6m',               4),
  ...units('Audio', 'XLR Cable 1m',               1),
  ...units('Audio', 'XLR to 3.5mm Cable 0.5m',   1),
  ...units('Audio', 'TRS Cable 3m',               2),
  ...units('Audio', 'TRS Cable 1.5m Stretchy',    1),
  ...units('Audio', 'Sennheiser SEN-508664',       1),
  ...units('Audio', 'Rycote Dead Cat',             2),
  ...units('Audio', 'Rycote Lav Muff',             1),
  ...units('Audio', 'Sound Blankets',              4),
  ...units('Audio', 'Rycote Stickies',             1),

  // ── Lighting ─────────────────────────────────────────────────────────────
  ...units('Lighting', 'Aputure 1200D',                  1, ['6LL10C45898']),
  ...units('Lighting', 'Aputure LS 600C Pro II',         1, ['7CFDBC102212']),
  ...units('Lighting', 'Aputure LS 600X Pro',            1, ['6HX11N54151']),
  ...units('Lighting', 'Aputure LS 300X BI-Mount',       1, ['6FA15E12624']),
  ...units('Lighting', 'Aputure Accent B7C 8-Light Kit', 1, ['6EQ227062 / 6EQ261084 / 6EQ267783 / 6EQ273886 / 6EQ278847 / 6EQ269195 / 6EQ268442']),
  ...units('Lighting', 'Arri 2K',                        2),
  ...units('Lighting', 'Arri 1K',                        1),
  ...units('Lighting', 'Dedo Lights 150w',               4, ['90693', '66978', '66957', '30175']),
  ...units('Lighting', 'Zhiyun Molus 100W',              1, ['2023DP0594']),
  ...units('Lighting', 'Zhiyun Molus G60W',              1, ['2023DP0591']),
  ...units('Lighting', 'Lite Panels Gemini 1x1',         1),

  // ── Modifiers ────────────────────────────────────────────────────────────
  ...units('Modifiers', 'Aputure F10 Fresnel',                1),
  ...units('Modifiers', 'Aputure Light Dome Mini MKII',       1),
  ...units('Modifiers', 'Aputure F10 Barn Doors',             1, ['6HW07K33469']),
  ...units('Modifiers', 'Aputure Lantern 90',                 1, ['6HM09B25896']),
  ...units('Modifiers', 'Aputure Spotlight Mount Set 26 Deg', 1, ['6DY04B54191']),
  ...units('Modifiers', 'Aputure Lightbox 30120',             1),
  ...units('Modifiers', 'SmallRig LA D65',                    1),
  ...units('Modifiers', 'Godox S120T',                        1),

  // ── Support ──────────────────────────────────────────────────────────────
  ...units('Support', 'Matthews 48x48 Road Flag Kit II',     1),
  ...units('Support', 'Fabric Sheets',                        5),
  ...units('Support', 'C-Stand Arm',                         3),
  ...units('Support', 'Lightstand',                          10),
  ...units('Support', 'C-Stand',                             1),
  ...units('Support', 'Knuckle',                             4),
  ...units('Support', 'Gaff Tape',                           3),
  ...units('Support', 'Black Foil',                          1),
  ...units('Support', 'Sachtler Aktiv 8 Flowtech',           2),
  ...units('Support', 'DJI RS3 Gimbal',                      1),
  ...units('Support', 'Sandbag',                             12),
  ...units('Support', 'Slider 3m',                           1),
  ...units('Support', 'Smallrig Teleprompter',               1),
  ...units('Support', 'Tilta Manual Follow Focus',           2),
  ...units('Support', 'Tilta Nucleus M Follow Focus',        1),
  ...units('Support', 'Pelican 1510 Carry On',               2),
  ...units('Support', 'Pelican 1615 Air Case',               2),
  ...units('Support', 'Smallrig Magic Arm + Clamp',          4),
  ...units('Support', 'Color Checker Passport Photo 2',      1),
  ...units('Support', 'Vlock Plate',                         1),
  ...units('Support', 'Smallrig Base Plate Rod',             4),
  ...units('Support', 'Smallrig Base Plate',                 2),
  ...units('Support', 'Smallrig Top Handle',                 2),
  ...units('Support', 'Smallrig Monitor Mount',              4),
  ...units('Support', 'Tilta Top Handle',                    2),
  ...units('Support', 'Tilta Side Handle',                   2),
  ...units('Support', 'Smallrig Side Handle',                3),
  ...units('Support', 'Lazy Susan',                          1),
  ...units('Support', 'Tilta Base Plate Rod',                4),

  // ── Batteries ────────────────────────────────────────────────────────────
  ...units('Batteries', 'Sony Battery',           8),
  ...units('Batteries', 'Fujifilm Battery',        1),
  ...units('Batteries', 'Insta360 Battery',        2),
  ...units('Batteries', 'Osmo Battery',           12),
  ...units('Batteries', 'Smallrig Vlock VB99',    10),
  ...units('Batteries', 'Neewer Vlock 99Wh',       1),
  ...units('Batteries', 'Vlock Battery',           3),
  ...units('Batteries', 'Anker PowerCore 10K',     4),
  ...units('Batteries', 'Zedamsan 100W Powerbank', 1),
  ...units('Batteries', 'Anker 140W Powerbank',    2),
  ...units('Batteries', 'Viltrox NPF 4400mAh',     2),
  ...units('Batteries', 'Viltrox NPF 2200mAh',     4),

  // ── Drone ────────────────────────────────────────────────────────────────
  ...units('Drone', 'DJI FPV',   1, ['37QBHC1BD101DD']),
  ...units('Drone', 'DJI Mini 3',1, ['1581F4XF3232N006H06G']),

  // ── Data ─────────────────────────────────────────────────────────────────
  ...units('Data', 'Lexar SD 64GB',            1),
  ...units('Data', 'Lexar SD 128GB',           4),
  ...units('Data', 'Lexar CFA 80GB',           1),
  ...units('Data', 'Lexar CFA 160GB',          1),
  ...units('Data', 'Lexar CFA 320GB',          1),
  ...units('Data', 'Sony Tough 160GB',         1),
  ...units('Data', 'Angelbird CFB 1TB',        4),
  ...units('Data', 'Sandisk SD 32GB',          1),
  ...units('Data', 'Sandisk Micro SD 64GB',    4),
  ...units('Data', 'Sandisk Micro SD 128GB',   4),
  ...units('Data', 'Sandisk Micro SD 256GB',   4),
  ...units('Data', 'Samsung Micro SD 128GB',   4),
  ...units('Data', 'Samsung Micro SD 512GB',   2),
  ...units('Data', 'Insta360 Micro SD 256GB',  2),
  ...units('Data', 'Samsung SSD 1TB',          2),
  ...units('Data', 'Samsung SSD 500GB',        1),
  ...units('Data', 'Sandisk Extreme Pro SSD 4TB', 1),
  ...units('Data', 'UGreen SSD 4TB',           1),
  ...units('Data', 'Lexar CFA Reader',         2),
  ...units('Data', 'Lexar CFB Reader',         2),
  ...units('Data', 'Lexar SD Card Reader',     3),
  ...units('Data', 'Data Kit Pouch',           1),

  // ── Power ────────────────────────────────────────────────────────────────
  ...units('Power', 'Sony Charger',                2),
  ...units('Power', 'Fujifilm Charger',            1),
  ...units('Power', 'NPF Charger',                 2),
  ...units('Power', 'Sefitopher Fast Charging Brick', 2),
  ...units('Power', 'UGreen Square Power Brick',   1),
];

// ── Run migration ─────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n🗑  Deleting existing London inventory…`);
  const { error: delErr } = await supabase
    .from('inventory')
    .delete()
    .eq('region', REGION);

  if (delErr) {
    console.error('❌  Delete failed:', delErr.message);
    process.exit(1);
  }
  console.log('   Done.');

  console.log(`\n📦  Inserting ${INVENTORY.length} units…`);

  // Insert in batches of 100 to avoid request size limits
  const BATCH = 100;
  for (let i = 0; i < INVENTORY.length; i += BATCH) {
    const batch = INVENTORY.slice(i, i + BATCH);
    const { error: insErr } = await supabase.from('inventory').insert(batch);
    if (insErr) {
      console.error(`❌  Insert failed at row ${i}:`, insErr.message);
      process.exit(1);
    }
    console.log(`   Inserted ${Math.min(i + BATCH, INVENTORY.length)} / ${INVENTORY.length}`);
  }

  console.log(`\n✅  London inventory updated — ${INVENTORY.length} units across 14 categories.\n`);
}

run();
