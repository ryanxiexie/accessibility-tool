function injectAccessibilityPopup() {
  // Check if the popup is already injected to avoid duplicates
  const existingPopup = document.querySelector('.accessibility-popup');
  if (existingPopup) return;

  // Inject CSS for popup
  const style = document.createElement('style');
  style.innerHTML = `
    .accessibility-popup {
      position: fixed;
	  top:0;
      right: 0;
      width: 40%;
	  height: 100vh;
      background-color: #fff;
      border: 1px solid #ccc;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      padding: 20px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
    }
    .accessibility-popup button {
      margin: 10px 0;
      padding: 10px;
      background-color: #333;
      color: white;
      border: none;
      cursor: pointer;
      border-radius: 5px;
    }
    .accessibility-popup button:hover {
      background-color: #555;
    }
    .accessibility-popup-close {
      position: absolute;
      top: 5px;
      right: 10px;
      cursor: pointer;
      font-size: 18px;
    }
  `;
  document.head.appendChild(style);

  // Create the popup container
  const popup = document.createElement('div');
  popup.className = 'accessibility-popup';
  popup.innerHTML = `
    <span class="accessibility-popup-close">&times;</span>
    <button id="increaseFont">Increase Font Size</button>
    <button id="decreaseFont">Decrease Font Size</button>
    <button id="toggleContrast">Toggle High Contrast</button>
  `;
  document.body.appendChild(popup);

  // Close button functionality
  document
    .querySelector('.accessibility-popup-close')
    .addEventListener('click', () => {
      popup.remove();
    });

  // Accessibility features
  let fontSize = 100;

  const bodyElements = document.body.querySelectorAll(
    '*:not(#accessibility-popup):not(#accessibility-popup *)'
  ); // Exclude the tool popup and its children

  document.getElementById('increaseFont').addEventListener('click', () => {
    fontSize += 10;
    bodyElements.body.style.fontSize = fontSize + '%';
  });

  document.getElementById('decreaseFont').addEventListener('click', () => {
    fontSize -= 10;
    bodyElements.body.style.fontSize = fontSize + '%';
  });

  let highContrast = false;
  document.getElementById('toggleContrast').addEventListener('click', () => {
    if (highContrast) {
      document.body.style.filter = 'none';
    } else {
      document.body.style.filter = 'contrast(200%)';
    }
    highContrast = !highContrast;
  });
}
