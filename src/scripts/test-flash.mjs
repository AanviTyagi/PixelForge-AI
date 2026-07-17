async function testFlash(name, key) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Hello, reply with one word: OK"
              }
            ]
          }
        ]
      })
    });
    const status = response.status;
    const text = await response.text();
    console.log(`Key: ${name} | Model: gemini-1.5-flash | Status: ${status}`);
    if (status !== 200) {
      console.log(`Response: ${text}\n`);
    } else {
      console.log(`Response: ${JSON.parse(text).candidates?.[0]?.content?.parts?.[0]?.text?.trim()}\n`);
    }
  } catch (e) {
    console.error(`Error for ${name}:`, e);
  }
}

async function run() {
  const keys = {
    "New Key 1": "AQ.Ab8RN6Le6nsxd-xAwT9VlK1KRjV9ykvM6thSsov19wPRu0DsAw",
    "New Key 2": "AQ.Ab8RN6KAKTPZlrlB5RnVuazGJoxcB2MhMrJ4zD75yiGF3OI_FA"
  };

  for (const [name, key] of Object.entries(keys)) {
    await testFlash(name, key);
  }
}

run();
