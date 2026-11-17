// Direct Chromium smoke test; no package downloads or external test service.
// Run with the Fergana preview and shared API running:
// node artifacts/skillcast-fergana/tests/browser-learner-flow.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:80';
const port = 9241;
const profileDir = await mkdtemp(join(tmpdir(), 'fergana-learner-test-'));
const chrome = spawn(process.env.CHROMIUM_PATH || '/repl/tools/bin/chromium', [
  '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`, '--no-first-run', 'about:blank',
], { stdio: 'ignore' });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let socket;
try {
  for (let i = 0; i < 60; i++) {
    try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch { await wait(150); }
  }
  const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).then((r) => r.json());
  socket = new WebSocket(target.webSocketDebuggerUrl);
  let serial = 0;
  const pending = new Map();
  const errors = [];
  const cvRequests = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      errors.push(message.params.args.map((arg) => arg.value ?? arg.description).join(' '));
    }
    if (message.method === 'Network.requestWillBeSent' && message.params.request.url.endsWith('/api/extract-cv')) {
      cvRequests.push(message.params.request.postData);
    }
  });
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  const send = (method, params = {}) => {
    const id = ++serial;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve) => pending.set(id, resolve));
  };
  const evaluate = async (expression) => {
    const message = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, replMode: true });
    if (message.result?.exceptionDetails) throw Error(JSON.stringify(message.result.exceptionDetails));
    return message.result?.result?.value;
  };
  const until = async (expression, label) => {
    for (let i = 0; i < 120; i++) {
      if (await evaluate(expression)) return;
      await wait(150);
    }
    throw Error(`Timed out: ${label}\n${await evaluate('document.body.innerText.slice(-2200)')}`);
  };
  const click = async (expression) => {
    await evaluate(`(() => { const node = ${expression}; if (!node || node.disabled) throw Error('Missing or disabled click target: ' + ${JSON.stringify(expression)} + '\\nButtons: ' + Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).join(' | ')); node.focus(); if (node.getAttribute('role') === 'tab') node.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 })); node.click(); })()`);
    await wait(120);
  };
  const textButton = (text) => `Array.from(document.querySelectorAll('button')).find(node => node.textContent.trim() === ${JSON.stringify(text)})`;
  const fill = async (selector, value) => {
    await evaluate(`(() => { const node = document.querySelector(${JSON.stringify(selector)}); if (!node) throw Error('Missing input'); Object.getOwnPropertyDescriptor(node.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(node, ${JSON.stringify(value)}); node.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  };
  const select = async (selector, label) => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse', pointerId: 1 }))`);
    await until(`document.querySelector('[role="option"]') !== null`, 'select options');
    await click(`Array.from(document.querySelectorAll('[role="option"]')).find(node => node.textContent.trim() === ${JSON.stringify(label)})`);
  };
  const tab = async (name) => {
    await click(`Array.from(document.querySelectorAll('[role="tab"]')).find(node => node.id.endsWith('-trigger-${name}'))`);
    await until(`document.querySelector('[role="tab"][data-state="active"]')?.id.endsWith('-trigger-${name}')`, `${name} tab`);
    assert.equal(await evaluate(`document.body.innerText.includes('Something went wrong')`), false);
  };
  const screenshot = async (name) => {
    await mkdir('generated-artifacts/learner-flow', { recursive: true });
    const result = await send('Page.captureScreenshot', { format: 'jpeg', quality: 65 });
    await writeFile(`generated-artifacts/learner-flow/${name}.jpg`, Buffer.from(result.result.data, 'base64'));
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1365, height: 950, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `${base}/` });
  await until(`document.querySelectorAll('button').length > 0`, 'app initialization');
  await evaluate(`window.testStore = (await import('/src/lib/store.ts')).useSkillCast; window.testT = (await import('/src/lib/i18n.ts')).makeT; testStore.getState().resetDemo(); testStore.getState().setLang('en');`);

  // Fresh learner enters the existing onboarding from the main navigation.
  await click(textButton('My forecast'));
  await until(`document.querySelector('#employment-status') !== null`, 'learner onboarding');
  await select('#employment-status', 'Working professional');
  await fill('#field-work', 'Education');
  await fill('#profession', 'Learning coordinator');
  await fill('#experience', '4');
  await click(textButton('Load synthetic sample CV'));
  await click(textButton('Scrub & extract skills'));
  await until(`testStore.getState().profile.cvScrub !== null && Object.keys(testStore.getState().profile.skills).length > 0`, 'CV extraction');
  assert.equal(await evaluate(`testStore.getState().profile.years`), 4, 'CV preserves experience entered by the learner');
  assert.ok(cvRequests.length > 0, 'CV extraction was called');
  assert.ok(cvRequests.every((body) => !body.includes('learner01@example.test') && !body.includes('+998 90 000 00 01')), 'Only scrubbed CV text was sent');
  await click(textButton('Continue'));
  await until(`document.querySelector('#career-goal') !== null`, 'interests and goal');
  await click(textButton(await evaluate(`testT('en')('interest.education')`)));
  await fill('#career-goal', 'Learn to design accessible digital lessons');
  for (let i = 0; i < 3; i++) {
    await evaluate(`(() => { const slider = document.querySelector('#budget [role="slider"]'); if (!slider) throw Error('Missing weekly budget slider'); slider.focus(); slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); })()`);
    await wait(100);
  }
  await click(textButton('Continue'));
  await until(`document.body.innerText.includes('Your Future Skills Radar')`, 'onboarding radar');
  await click(textButton('Continue'));
  await until(`document.querySelector('button[role="radio"]') !== null`, 'learning direction');
  await click(`Array.from(document.querySelectorAll('button[role="radio"]')).find(node => node.textContent.includes('Transition to a related role'))`);
  await click(`Array.from(document.querySelectorAll('button[aria-pressed]')).find(node => node.textContent.includes('SkillCast profile fit:'))`);
  await click(textButton('Continue'));
  await until(`document.body.innerText.includes('Remote or hybrid work')`, 'preferences');
  await click(textButton('Build my forecast'));
  await until(`document.querySelector('[role="tab"][data-state="active"]')?.id.endsWith('-trigger-overview')`, 'finish on Overview');
  assert.equal(await evaluate('testStore.getState().learnerOnboarded'), true);
  assert.equal(await evaluate('testStore.getState().profile.objective'), 'Learn to design accessible digital lessons');
  assert.equal(await evaluate('testStore.getState().profile.budget'), 8);
  assert.equal(await evaluate('testStore.getState().profile.extended.fieldOfWork'), 'Education');
  console.log('PASS fresh onboarding, CV scrubbing, saved learning goal and weekly commitment');
  await until(`!document.body.innerText.includes('Loading signals…')`, 'signals load');
  await tab('matches');
  await screenshot('matches-desktop');
  await click(textButton('Explore Roadmap'));
  await until(`document.querySelector('[role="tab"][data-state="active"]')?.id.endsWith('-trigger-harada')`, 'match opens its roadmap');
  await tab('pathway');
  await until(`document.querySelector('a[href^="#learning-"]') !== null`, 'skill gap to learning link');
  await click(`document.querySelector('a[href^="#learning-"]')`);
  assert.equal(await evaluate(`Boolean(document.querySelector(location.hash))`), true);
  const mark = await evaluate(`testT('en')('pw.mark')`);
  await click(textButton(mark));
  await tab('progress');
  assert.ok(await evaluate('testStore.getState().completedCourses.length > 0'));
  await click(`document.querySelector('button[aria-pressed][aria-label^="Mark complete"]')`);
  assert.equal(await evaluate(`Object.values(testStore.getState().profile.haradaTaskStatuses).filter(status => status === 'completed').length`), 8);
  await fill('textarea', 'Practiced planning an accessible lesson');
  await tab('harada');
  await tab('sdg');
  assert.ok(await evaluate(`document.body.innerText.includes('courses and 1 skill-practice milestones completed')`));
  await tab('radar');
  await tab('demand');
  await tab('matches');
  for (const [code, label] of [['uz', 'Uzbek'], ['ru', 'Русский'], ['en', 'English']]) {
    await select('header [role="combobox"]', label);
    await until(`document.documentElement.lang === '${code}'`, `switch language to ${code}`);
    assert.equal(await evaluate('testStore.getState().lang'), code);
    for (const name of ['overview', 'matches', 'radar', 'pathway', 'harada', 'progress', 'sdg']) await tab(name);
    await tab('matches');
  }
  const completeProfile = await evaluate('JSON.stringify(testStore.getState().profile)');

  // Editing reconnects the existing setup, without resetting profile or progress.
  await click(textButton('Edit learner profile'));
  await until(`document.querySelector('#profession') !== null`, 'edit learner profile');
  assert.equal(await evaluate(`document.querySelector('#profession').value`), 'Learning coordinator');
  await click(textButton('My forecast'));
  await tab('matches');
  await send('Page.reload');
  await until(`document.querySelectorAll('header button').length > 0`, 'reload persisted learner');
  await evaluate(`window.testStore = (await import('/src/lib/store.ts')).useSkillCast;`);
  await click(textButton('My forecast'));
  await tab('progress');
  assert.equal(await evaluate('testStore.getState().profile.weeklyReflection'), 'Practiced planning an accessible lesson');
  assert.ok(await evaluate('testStore.getState().completedCourses.length > 0'));

  // Include a legacy/custom interest and skill, nullable saved fields, and an
  // empty learner in every language. Hydration follows the real persist merge.
  for (const [name, data] of [
    ['partial', { interests: ['a personal interest'], skills: { 'legacy-custom-skill': 3 } }],
    ['incomplete', { interests: null, skills: null, extended: null, inclusion: null }],
    ['fresh', {}],
    ['complete', JSON.parse(completeProfile)],
  ]) {
    for (const code of ['en', 'uz', 'ru']) {
      await evaluate(`localStorage.setItem('skillcast-poc', JSON.stringify({state:{lang:${JSON.stringify(code)},userType:'individual',onboarded:true,learnerOnboarded:true,profile:${JSON.stringify(data)},chosenRole:'ai-ops-specialist',completedCourses:null,haradaTaskStatus:null},version:0})); await testStore.persist.rehydrate(); testStore.setState({view:'dashboard',dashTab:'matches'});`);
      await wait(150);
      for (const name of ['overview', 'matches', 'radar', 'pathway', 'harada', 'progress', 'sdg']) await tab(name);
      console.log(`PASS ${name} profile / ${code}: all learner screens`);
    }
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await tab('matches');
  await screenshot('matches-mobile');
  assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), 'No horizontal overflow at mobile width');
  assert.deepEqual(errors, [], `Browser errors: ${errors.join('\n')}`);
  console.log('PASS onboarding, CV privacy, profile persistence, course and roadmap progress, language cycle, desktop and mobile layouts');
} finally {
  socket?.close();
  chrome.kill('SIGTERM');
  await new Promise((resolve) => chrome.once('exit', resolve));
  await rm(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
