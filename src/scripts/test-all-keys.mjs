async function testKeyModel(name, key, model) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning?key=${key}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: "a cat running",
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "16:9",
          durationSeconds: 6,
        }
      })
    });
    const status = response.status;
    const text = await response.text();
    console.log(`Key: ${name} | Model: ${model} | Status: ${status}`);
    if (status !== 200) {
      console.log(`Error: ${text.slice(0, 150)}...\n`);
    } else {
      console.log(`Success!\n`);
    }
  } catch (e) {
    console.error(`Error for ${name} with ${model}:`, e);
  }
}

async function run() {
  const keys = {
    "New Key 1": "AQ.Ab8RN6Le6nsxd-xAwT9VlK1KRjV9ykvM6thSsov19wPRu0DsAw",
    "New Key 2": "AQ.Ab8RN6KAKTPZlrlB5RnVuazGJoxcB2MhMrJ4zD75yiGF3OI_FA"
  };

  const models = [
    "veo-3.1-generate-preview",
    "veo-3.1-fast-generate-preview",
    "veo-3.1-lite-generate-preview"
  ];

  for (const [name, key] of Object.entries(keys)) {
    for (const model of models) {
      await testKeyModel(name, key, model);
    }
  }
}

run();

