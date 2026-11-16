#!/usr/bin/env node
// Genera una imagen PNG en el estilo excalidraw-visualizations vía kie.ai (Nano Banana 2).
// Uso: node generate-visual.js "<prompt>" "<output.png>" "<aspect_ratio>" [--input <local-image-path> ...]

const fs = require('fs');
const path = require('path');

function loadEnv(envPath) {
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const SKILL_DIR = path.resolve(__dirname, '..');
const fileEnv = loadEnv(path.join(SKILL_DIR, '.env'));
// Una variable de entorno vacía no debe tapar el valor del .env.
const API_KEY = process.env.KIE_AI_API_KEY || fileEnv.KIE_AI_API_KEY;

if (!API_KEY) {
  console.error([
    'Falta KIE_AI_API_KEY.',
    '',
    'Esto solo hace falta para generar imágenes PNG con IA.',
    'Los archivos .excalidraw se generan sin ninguna key.',
    '',
    'Para habilitarlo:',
    `  1. cp "${path.join(SKILL_DIR, '.env.example')}" "${path.join(SKILL_DIR, '.env')}"`,
    '  2. Poner la key de https://kie.ai en ese archivo',
  ].join('\n'));
  process.exit(1);
}

const API_BASE = 'https://api.kie.ai/api/v1';

function parseArgs(argv) {
  const [prompt, outputPath, aspectRatio] = argv;
  const inputs = [];
  for (let i = 3; i < argv.length; i++) {
    if (argv[i] === '--input') inputs.push(argv[++i]);
  }
  return { prompt, outputPath, aspectRatio: aspectRatio || 'auto', inputs };
}

async function uploadReferenceImage(localPath) {
  const fileName = path.basename(localPath);
  const buf = fs.readFileSync(localPath);
  const form = new FormData();
  form.append('file', new Blob([buf]), fileName);
  form.append('uploadPath', 'excalidraw-visualizations');
  form.append('fileName', fileName);

  const res = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok || !json?.data?.downloadUrl) {
    throw new Error(`Falló la subida de ${fileName}: ${JSON.stringify(json)}`);
  }
  return json.data.downloadUrl;
}

async function createTask(prompt, aspectRatio, imageUrls) {
  const body = {
    model: 'nano-banana-2',
    input: {
      prompt,
      aspect_ratio: aspectRatio,
      resolution: '2K',
      output_format: 'png',
      ...(imageUrls.length ? { image_input: imageUrls } : {}),
    },
  };
  const res = await fetch(`${API_BASE}/jobs/createTask`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.code !== 200 || !json?.data?.taskId) {
    throw new Error(`Falló createTask: ${JSON.stringify(json)}`);
  }
  return json.data.taskId;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollTask(taskId, { intervalMs = 4000, timeoutMs = 180000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(`${API_BASE}/jobs/recordInfo?taskId=${taskId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const json = await res.json();
    const state = json?.data?.state;
    if (state === 'success') {
      const result = JSON.parse(json.data.resultJson);
      return result.resultUrls[0];
    }
    if (state === 'fail') {
      throw new Error(`Generación falló: ${json.data.failCode} ${json.data.failMsg}`);
    }
    process.stdout.write(`.`);
    await sleep(intervalMs);
  }
  throw new Error('Timeout esperando el resultado de la tarea');
}

async function downloadImage(url, outputPath) {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buf);
}

async function main() {
  const { prompt, outputPath, aspectRatio, inputs } = parseArgs(process.argv.slice(2));
  if (!prompt || !outputPath) {
    console.error('Uso: generate-visual.js "<prompt>" "<output.png>" "<aspect_ratio>" [--input <path> ...]');
    process.exit(1);
  }

  console.log(`Subiendo ${inputs.length} imagen(es) de referencia...`);
  const imageUrls = [];
  for (const input of inputs) {
    imageUrls.push(await uploadReferenceImage(input));
  }

  console.log('Creando tarea de generación...');
  const taskId = await createTask(prompt, aspectRatio, imageUrls);
  console.log(`Tarea ${taskId} creada. Esperando resultado`);

  const resultUrl = await pollTask(taskId);
  console.log(`\nDescargando resultado a ${outputPath}...`);
  await downloadImage(resultUrl, outputPath);
  console.log('Listo:', outputPath);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
