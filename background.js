chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: injectAccessibilityWidget
  });
});

function injectAccessibilityWidget() {
  // Inject CSS
  const style = document.createElement('style');
  style.innerHTML = `
    .accessibility-widget { 
      position: fixed; 
      top: 10px; 
      right: 10px; 
      z-index: 9999; 
      background: #333; 
      color: #fff; 
      padding: 10px; 
      border-radius: 5px; 
    }
    .accessibility-widget button {
      margin: 5px;
      padding: 5px;
      background: #555;
      color: white;
      border: none;
      cursor: pointer;
    }
    .accessibility-widget button:hover {
      background: #777;
    }
  `;
  document.head.appendChild(style);

  // Create widget
  const widget = document.createElement('div');
  widget.className = 'accessibility-widget';
  widget.innerHTML = `
    <button onclick="increaseFontSize()">Increase Font Size</button>
    <button onclick="decreaseFontSize()">Decrease Font Size</button>
    <button onclick="toggleContrast()">Toggle High Contrast</button>
  `;
  document.body.appendChild(widget);

  // Functionality
  let fontSize = 100;
  function increaseFontSize() {
    fontSize += 10;
    document.body.style.fontSize = fontSize + '%';
  }

  function decreaseFontSize() {
    fontSize -= 10;
    document.body.style.fontSize = fontSize + '%';
  }

  let highContrast = false;
  function toggleContrast() {
    if (highContrast) {
      document.body.style.filter = 'none';
    } else {
      document.body.style.filter = 'contrast(200%)';
    }
    highContrast = !highContrast;
  }
}
