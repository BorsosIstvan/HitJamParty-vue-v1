/**
 * Professional asynchronous JSONP wrapper for the iTunes API.
 * Bypasses CORS errors without an external proxy server,
 * wrapped in a clean Promise.
 */
export function searchiTunes(artist, title) {
  return new Promise((resolve) => {
    try {
      const cleanArtist = artist.replace('&', ' ');
      const searchTerm = encodeURIComponent(`${cleanArtist} ${title}`);
      
      // 1. Generate a completely unique callback name in the global window object
      const callbackName = `itunesCallback_${Math.floor(Math.random() * 100000)}`;
      
      // 2. Create the callback function that iTunes will invoke
      window[callbackName] = function(data) {
        // Cleanup background script elements
        const scriptElement = document.getElementById(callbackName);
        if (scriptElement) scriptElement.remove();
        delete window[callbackName];

        // Validation and resolving the Promise
        if (data.results && data.results.length > 0 && data.results[0].previewUrl) {
          const firstResult = data.results[0];
          resolve({
            success: true,
            previewUrl: firstResult.previewUrl,
            trackName: firstResult.trackName,
            artistName: firstResult.artistName
          });
        } else {
          resolve({ success: false, error: "No audio preview found for this track." });
        }
      };

      // 3. Dynamic script creation and injection with iTunes API URL
      const script = document.createElement('script');
      script.id = callbackName;
      script.src = `https://itunes.apple.com/search?term=${searchTerm}&limit=1&entity=song&callback=${callbackName}`;
      
      // Error handling if iTunes server is completely unreachable
      script.onerror = () => {
        if (window[callbackName]) delete window[callbackName];
        script.remove();
        resolve({ success: false, error: "The iTunes server is unreachable." });
      };

      document.body.appendChild(script);

    } catch (error) {
      console.error("iTunes JSONP Error:", error);
      resolve({ success: false, error: error.message });
    }
  });
}
