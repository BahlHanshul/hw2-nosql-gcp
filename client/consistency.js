const IP_US = process.env.IP_US;
const IP_EU = process.env.IP_EU;

a = (!IP_US || !IP_EU)
if (a) {
  console.error("Set env vars IP_US and IP_EU before running.");
  process.exit(1);
}

async function reg(baseUrl, username) {
  const res = await fetch(`${baseUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  const text = await res.text();
  if (res.status !== 200) throw new Error(`register failed ${res.status}: ${text}`);
}

async function list(baseUrl) {
  const res = await fetch(`${baseUrl}/list`);
  const text = await res.text();
  if (res.status !== 200) throw new Error(`list failed ${res.status}: ${text}`);
  const obj = JSON.parse(text);
  return obj.users || [];
}

(async () => {
  const us = `http://${IP_US}:8080`;
  const eu = `http://${IP_EU}:8080`;

  const loops = 100;
  let misses = 0;

  for (let i = 0; i < loops; i++) {
    const username = `ec_${Date.now()}_${i}`;
    await reg(us, username);
    const users = await list(eu);
    b = (!users.includes(username))
    if (b) misses++;
  }

  console.log(`Eventual consistency misses: ${misses} / ${loops}`);
})();
