async function check() {
  const key = 'AIzaSyATB0Fr_IIRRhznBU7aJCtYXEB_77PPuSs';
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    if (data.models) {
      data.models.forEach(m => console.log(m.name));
    } else {
      console.log('Error:', data.error.message);
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}
check();
