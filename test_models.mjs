async function check() {
  try {
    const key = 'AIzaSyDI_Mmr-y3WB0ryiHl7ccXJGC1WWQZ2j1s';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    
    if (data.models) {
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes('generateContent')) {
          console.log(`Model: ${m.name} | Methods: ${m.supportedGenerationMethods.join(', ')}`);
        }
      });
    } else {
      console.log('Error:', data);
    }
  } catch (e) {
    console.error(e);
  }
}
check();
