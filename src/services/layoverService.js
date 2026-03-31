export const checkLayoverPermission = async (country, passport) => {
  try {
    const url = `https://nondeliriously-quartus-allena.ngrok-free.dev/check?country=${encodeURIComponent(country)}&passport=${encodeURIComponent(passport)}`;
    console.log('[Layover API] Checking:', { country, passport, url });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    if (!response.ok) {
      console.error('[Layover API] Response not OK:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log('[Layover API] Success:', data);
    return data;
  } catch (error) {
    console.error('[Layover API] Error:', error);
    return null;
  }
};
