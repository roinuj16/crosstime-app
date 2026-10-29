#!/usr/bin/env node
/**
 * Gera a voz gravada do CrossTimer na ElevenLabs.
 *
 *   ELEVENLABS_API_KEY=sua_chave npm run voices -- --list            # lista as vozes da sua conta
 *   ELEVENLABS_API_KEY=sua_chave npm run voices -- --voice ID --sample   # 3 frases de teste em voice-samples/
 *   ELEVENLABS_API_KEY=sua_chave npm run voices -- --voice ID         # tudo (inglês)
 *
 * Opções:
 *   --voice ID        voz para os dois idiomas (ou ELEVENLABS_VOICE_ID)
 *   --voice-en ID     voz só do inglês   (ou ELEVENLABS_VOICE_EN)
 *   --voice-pt ID     voz só do português (ou ELEVENLABS_VOICE_PT)
 *   --lang en|pt      só um idioma
 *   --only a,b,c      só estas frases (chaves de src/voice/lines.json)
 *   --sample          só as frases de teste (SAMPLE abaixo), em voice-samples/<voz>/ — não mexe no app
 *   --force           gera de novo mesmo se o arquivo já existir
 *   --model ID        modelo da ElevenLabs (padrão: eleven_v4; alternativa: eleven_multilingual_v2)
 *   --manifest        não chama a API; só atualiza src/voice/clips.ts
 *
 * A chave fica só no seu computador: não vai para o GitHub nem para o app.
 * Arquivos: assets/voice/<idioma>/<chave>.mp3. Frases que já existem são puladas,
 * então dá para rodar de novo se cair a conexão no meio.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LINES = JSON.parse(readFileSync(join(ROOT, 'src/voice/lines.json'), 'utf8'));
const OUT = join(ROOT, 'assets/voice');
const MANIFEST = join(ROOT, 'src/voice/clips.ts');
// Só inglês por enquanto: a voz em português soava mal. As frases em pt continuam em lines.json
// e podem ser geradas de propósito com --lang pt (não entram no app enquanto LANGS não tiver 'pt').
const LANGS = ['en'];
const ALL_LANGS = ['en', 'pt'];
// Frases de teste para comparar vozes. Ficam em voice-samples/<id da voz>/ (fora do app, fora do Git)
// e são sempre geradas de novo, então dá para testar várias vozes e comparar lado a lado.
const SAMPLE = [
  ['are_you_ready', 'Are you ready?'],
  ['countdown_go', 'Three... two... one... GO!'],
  ['last_round', 'Last round!'],
];
const SAMPLES_DIR = join(ROOT, 'voice-samples');
const API = process.env.ELEVENLABS_API_BASE ?? 'https://api.elevenlabs.io/v1'; // trocar só para testes

// ---------- argumentos ----------
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };

const key = process.env.ELEVENLABS_API_KEY;
const model = opt('model') ?? process.env.ELEVENLABS_MODEL ?? 'eleven_v4';
const baseVoice = opt('voice') ?? process.env.ELEVENLABS_VOICE_ID;
const voiceFor = {
  en: opt('voice-en') ?? process.env.ELEVENLABS_VOICE_EN ?? baseVoice,
  pt: opt('voice-pt') ?? process.env.ELEVENLABS_VOICE_PT ?? baseVoice,
};
const langs = opt('lang') ? [opt('lang')] : LANGS;
const only = opt('only')?.split(',').map((s) => s.trim()).filter(Boolean);

// Voz de coach: firme e com energia, mas sem variar demais de uma frase para outra.
// Os modelos mais novos (v4) não aceitam style/speed; os antigos aceitam.
const OLD_MODEL = /multilingual_v2|monolingual|turbo_v2$|flash_v2$/.test(model);
const VOICE_SETTINGS = OLD_MODEL
  ? { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true }
  : { stability: 0.45, similarity_boost: 0.8 };
/** Corpo do pedido. language_code evita que "Round cinco" saia com sotaque de inglês. */
function body(job, minimal) {
  if (minimal) return { text: job.text, model_id: model };
  return { text: job.text, model_id: model, voice_settings: VOICE_SETTINGS, ...(OLD_MODEL ? {} : { language_code: job.lang }) };
}

function fail(msg) { console.error(`\n✖ ${msg}\n`); process.exit(1); }

// ---------- manifesto: o app só conhece os arquivos que existem ----------
function writeManifest() {
  const blocks = [];
  let total = 0;
  for (const lang of LANGS) {
    const dir = join(OUT, lang);
    const files = existsSync(dir) ? new Set(readdirSync(dir).filter((f) => f.endsWith('.mp3'))) : new Set();
    const keys = Object.keys(LINES[lang]).filter((k) => files.has(`${k}.mp3`));
    total += keys.length;
    if (keys.length) {
      blocks.push(`  ${lang}: {\n${keys.map((k) => `    ${k}: require('../../assets/voice/${lang}/${k}.mp3'),`).join('\n')}\n  },`);
    }
  }
  writeFileSync(MANIFEST,
    `// Gerado por scripts/generate-voices.mjs — não edite à mão.\n` +
    `// Lista os áudios da voz gravada que existem em assets/voice/.\n` +
    `export const VOICE_CLIPS: Partial<Record<'en' | 'pt', Record<string, number>>> = {\n${blocks.join('\n')}\n};\n`);
  console.log(`✔ src/voice/clips.ts atualizado (${total} áudios)`);
}

if (flag('manifest')) { writeManifest(); process.exit(0); }

// ---------- API ----------
if (!key) fail('Falta a chave. Rode assim:\n  ELEVENLABS_API_KEY=sua_chave npm run voices -- --list');
if (typeof fetch !== 'function') fail('Este script precisa do Node 18 ou mais novo (node --version).');

async function api(path, init = {}, { soft = false } = {}) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${API}${path}`, { ...init, headers: { 'xi-api-key': key, ...(init.headers ?? {}) } });
    if (res.ok) return res;
    const body = await res.text().catch(() => '');
    if (soft && (res.status === 400 || res.status === 422)) return null; // quem chamou tenta de outro jeito
    if ((res.status === 429 || res.status >= 500) && attempt < 6) {
      const wait = 1000 * 2 ** attempt;
      console.log(`  … ElevenLabs ocupada (${res.status}), tentando de novo em ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (res.status === 401) fail('Chave recusada (401). Confira a API key e se ela tem permissão de Text to Speech.');
    fail(`ElevenLabs respondeu ${res.status}: ${body.slice(0, 300)}`);
  }
}

if (flag('list')) {
  const res = await api('/voices');
  const { voices } = await res.json();
  console.log('\nVozes da sua conta (ouça no site e escolha uma; copie o ID):\n');
  for (const v of voices) {
    const l = v.labels ?? {};
    const tags = [l.gender, l.age, l.accent, l.description ?? l.descriptive, l.use_case].filter(Boolean).join(', ');
    console.log(`  ${v.voice_id}  ${v.name}${tags ? `  (${tags})` : ''}`);
  }
  console.log('\nDepois: npm run voices -- --voice ID --sample\n');
  process.exit(0);
}

for (const lang of langs) {
  if (!ALL_LANGS.includes(lang)) fail(`Idioma desconhecido: ${lang} (use en ou pt)`);
  if (!voiceFor[lang]) fail(`Falta escolher a voz. Rode --list para ver os IDs e depois --voice ID.`);
}

// ---------- geração ----------
const jobs = [];
if (flag('sample')) {
  const lang = langs[0];
  for (const [k, text] of SAMPLE) jobs.push({ lang, k, text, file: join(SAMPLES_DIR, voiceFor[lang], `${k}.mp3`) });
} else for (const lang of langs) {
  const keys = only ?? Object.keys(LINES[lang]);
  for (const k of keys) {
    const text = LINES[lang][k];
    if (!text) fail(`Frase desconhecida: ${k}`);
    const file = join(OUT, lang, `${k}.mp3`);
    if (existsSync(file) && !flag('force')) continue;
    jobs.push({ lang, k, text, file });
  }
}

const chars = jobs.reduce((n, j) => n + j.text.length, 0);
console.log(`\nModelo ${model} · ${jobs.length} frases · ${chars} caracteres`);
if (!jobs.length) console.log('Nada novo para gerar (use --force para refazer).');

let done = 0;
async function worker() {
  for (let job = jobs.shift(); job; job = jobs.shift()) {
    const send = (minimal, soft) => api(`/text-to-speech/${voiceFor[job.lang]}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify(body(job, minimal)),
    }, { soft });
    // se o modelo recusar algum ajuste, repete só com texto e modelo
    const res = (await send(false, true)) ?? (await send(true, false));
    mkdirSync(dirname(job.file), { recursive: true });
    writeFileSync(job.file, Buffer.from(await res.arrayBuffer()));
    done++;
    console.log(`  ✔ ${job.lang}/${job.k}.mp3  "${job.text}"`);
  }
}
await Promise.all([worker(), worker()]); // 2 de cada vez: dentro do limite dos planos mais baratos

if (flag('sample')) {
  console.log(`\nPronto: ${done} áudios de teste em voice-samples/${voiceFor[langs[0]]}/`);
  console.log('Para abrir a pasta: open voice-samples');
  console.log('Gostou da voz? Gere as frases do app: npm run voices -- --voice ' + voiceFor[langs[0]]);
  process.exit(0);
}
writeManifest();
console.log(`\nPronto: ${done} áudios em assets/voice/.`);
 console.log('Ouça alguns e, se estiver tudo certo:\n  git add -A && git commit -m "Voz gravada" && git push');
