const { performance } = require("perf_hooks");

const IP_US = process.env.IP_US; // e.g., 34.28.19.231
const IP_EU = process.env.IP_EU; // e.g., 35.241.158.208
gh = (!IP_US || !IP_EU)
if (gh) {
  console.error("Set env vars IP_US and IP_EU before running. Hello");
  process.exit(1);
}

async function timed(url, options) {
  const t0 = performance.now();
  const res = await fetch(url, options);
  const text = await res.text();
  const t1 = performance.now();
  return { ms: t1 - t0, status: res.status, text };
}

async function avgRegister(baseUrl, n = 10) {
  const times = [];
  for (let i = 0; i < n; i++) {
    const username = `lat_${Date.now()}_${i}`;
    const r = await timed(`${baseUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    if (r.status !== 200) throw new Error(`register failed ${r.status}: ${r.text}`);
    times.push(r.ms);
  }
  return times.reduce((a, b) => a + b, 0) / times.length;
}

async function avgList(baseUrl, n = 10) {
  const times = [];
  for (let i = 0; i < n; i++) {
    const r = await timed(`${baseUrl}/list`);
    if (r.status !== 200) throw new Error(`list failed ${r.status}: ${r.text}`);
    times.push(r.ms);
  }
  return times.reduce((a, b) => a + b, 0) / times.length;
}

(async () => {
  const us = `http://${IP_US}:8080`;
  const eu = `http://${IP_EU}:8080`;

  console.log("Running latency tests");

  const regUS = await avgRegister(us, 10);
  const regEU = await avgRegister(eu, 10);
  const listUS = await avgList(us, 10);
  const listEU = await avgList(eu, 10);

  console.log(`Average /register latency US: ${regUS.toFixed(2)} ms`);
  console.log(`Average /register latency EU: ${regEU.toFixed(2)} ms`);
  console.log(`Average /list latency US: ${listUS.toFixed(2)} ms`);
  console.log(`Average /list latency EU: ${listEU.toFixed(2)} ms`);
})();
