chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (!tab.url.startsWith('chrome://')) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: injectToolIconAndPopup,
      });
    }
  }
});
// Inject the tool icon and also the popup function
function injectToolIconAndPopup() {
  const existingIcon = document.getElementById('accessibility-tool-icon');
  if (existingIcon) {
    return; // Avoid injecting multiple icons
  }

  // Create tool icon container (floating button)
  const toolIcon = document.createElement('span');
  toolIcon.id = 'accessibility-tool-icon';
  toolIcon.style.position = 'fixed';
  toolIcon.style.bottom = '20px';
  toolIcon.style.right = '20px';
  toolIcon.style.width = '50px';
  toolIcon.style.height = '50px';
  toolIcon.style.background = '#ffc72c';
  toolIcon.style.borderRadius = '50%';
  toolIcon.style.cursor = 'pointer';
  toolIcon.style.zIndex = '9999';
  toolIcon.style.display = 'flex';
  toolIcon.style.justifyContent = 'center';
  toolIcon.style.alignItems = 'center';

  // Create the img tag for the tool icon
  const toolIconImg = document.createElement('img');
  toolIconImg.src = chrome.runtime.getURL('Images/tool-icon.png'); // Get the local image file
  toolIconImg.style.width = '100%'; // Adjust size as needed
  toolIconImg.style.height = '100%'; // Adjust size as needed
  toolIconImg.style.borderRadius = '50%'; // If you want a circular icon

  // Append the img to the span container
  toolIcon.appendChild(toolIconImg);
  document.body.appendChild(toolIcon);

  // Add event listener to open popup with tools
  toolIcon.addEventListener('click', injectAccessibilityPopup);

  // Include the function that opens the popup
  function injectAccessibilityPopup() {
    // Check if popup already exists
    const existingPopup = document.querySelector('.accessibility-popup');
    if (existingPopup) return;

    // Inject CSS for popup
    const style = document.createElement('style');
    style.innerHTML = `
        .accessibility-popup {
            position: fixed;
            top: 0;
            right: 0;
            width: 380px;
            height: 100vh;
            background-color: #f5f5f5;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            display: flex;
            flex-direction: column;
        }

        .popup-header {
            background: #ffc72c;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .popup-header h2 {
            margin: 0;
            font-size: 18px;
            color: #000;
        }

        .popup-close {
            cursor: pointer;
            font-size: 24px;
            color: #000;
        }

        .popup-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            padding: 15px;
            overflow-y: auto;
        }

        .popup-item {
            background: white;
            border-radius: 8px;
            padding: 15px 10px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .popup-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .popup-item-icon {
            width: 32px;
            height: 32px;
            margin-bottom: 8px;
            object-fit: contain;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }

        .popup-item span {
            display: block;
            font-size: 14px;
            color: #333;
            font-weight: bold;
        }

        .highlighted-paragraph {
            background-color: yellow !important;
            padding: 10px !important;
            border-radius: 4px !important;
            box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
            position: relative !important;
            z-index: 1000 !important;
        }

        .popup-footer {
            padding: 15px 20px;
            background: white;
            border-top: 1px solid #eee;
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .donate-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .donate-text {
            font-size: 12px;
            color: #666;
            margin: 0;
        }

        .donate-button {
            background: #ffc72c;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.3s;
        }

        .donate-button:hover {
            background: #ffb700;
        }

        .attribution {
            font-size: 12px;
            color: #666;
            text-align: right;
        }

        .attribution a {
            color: #4F46E5;
            text-decoration: none;
            font-weight: bold;
            font-size: 22px;
        }

        .attribution a:hover {
            text-decoration: underline;
        }

        .coming-soon {
            padding: 15px 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
            font-style: italic;
            border-top: 1px solid #eee;
            background: white;
            margin-top: 40px;
        }
    `;
    document.head.appendChild(style);

    // Create the popup container
    const popup = document.createElement('div');
    popup.className = 'accessibility-popup';
    popup.innerHTML = `
        <div class="popup-header">
            <h2>Accessibility Menu</h2>
            <span class="popup-close">×</span>
        </div>
        <div class="popup-grid">
        <div class="popup-item" id="increaseFont">
                <img src="${chrome.runtime.getURL(
                  'Images/bigger-text-size.png'
                )}" alt="" class="popup-item-icon">
                <span>Bigger Text</span>
            </div>
            <div class="popup-item" id="decreaseFont">
                <img src="${chrome.runtime.getURL(
                  'Images/smaller-text-size.png'
                )}" alt="" class="popup-item-icon">
                <span>Smaller Text</span>
            </div>
            <div class="popup-item" id="toggleContrast">
                <img src="${chrome.runtime.getURL(
                  'Images/contrast.png'
                )}" alt="" class="popup-item-icon">
                <span>Toggle Contrast</span>
            </div>
            <div class="popup-item" id="toggleAutoRead">
                <img src="${chrome.runtime.getURL(
                  'Images/screen-reader.png'
                )}" alt="" class="popup-item-icon">
                <span>Enable Auto Read Mode</span>
            </div>
            
            <div class="popup-item" id="toggleclickRead">
                <img src="${chrome.runtime.getURL(
                  'Images/click-read.png'
                )}" alt="" class="popup-item-icon">
                <span>Enable Click Read Mode</span>
            </div>
            
            <div class="popup-item" id="resetTool">
                <img src="${chrome.runtime.getURL('Images/reset.png')}" 
                     alt="Reset" 
                     class="popup-item-icon"
                     onerror="this.style.display='none'"
                >
                <span>Reset All</span>
            </div>
        </div>
        <div class="coming-soon">
            More free features coming soon!
        </div>
        <div class="popup-footer">
            <div class="donate-section">
                <p class="donate-text">Help us keep it free!</p>
                <button class="donate-button" onclick="window.open('https://webease-hub.web.app/donate', '_blank')">Donate</button>
            </div>
            <div class="attribution">
                Created and supported by<br>
                <a href="https://webease-hub.web.app/" target="_blank">WebEase Hub</a>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    // Add click handlers for close button
    document.querySelector('.popup-close').addEventListener('click', () => {
      popup.remove();
      document.removeEventListener('click', handleClickOutsidePopup);
    });

    // Add click outside functionality
    function handleClickOutsidePopup(event) {
      if (!popup.contains(event.target)) {
        // Check if the click is outside the popup
        popup.remove(); // Close the popup
        document.removeEventListener('click', handleClickOutsidePopup); // Remove the event listener after closing
      }
    }

    // Add the event listener to the document when the popup is open
    setTimeout(() => {
      document.addEventListener('click', handleClickOutsidePopup);
    }, 0); // Use setTimeout to ensure this runs after the popup is fully rendered

    // Stop event propagation when clicking inside the popup
    popup.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevents the click inside the popup from triggering the outside click handler
    });

    // Accessibility features
    let clickRead = false; // Read mode state
    let autoRead = false; // Auto read state
    let autoReadInterval = null; // Store the interval for auto reading
    let currentIndex = localStorage.getItem('currentIndex')
      ? parseInt(localStorage.getItem('currentIndex'), 10)
      : 0; // To keep track of the current paragraph index
    let paragraphs = Array.from(
      document.body.querySelectorAll('p,h1, h2, h3,h4,h5,ul, li')
    ); // Collect paragraphs and headings

    // Collect paragraphs and headings, excluding menu and header elements
    let autoParagraphs = paragraphs.filter((element) => {
      return (
        !element.closest('header') &&
        !element.closest('nav') &&
        !element.closest('.menu') &&
        !element.closest('.footer')
      );
    });

    // Load auto-read state from localStorage on popup open
    const savedAutoRead = localStorage.getItem('autoRead');
    if (savedAutoRead === 'true') {
      autoRead = true;
      const autoReadButton = document.getElementById('toggleAutoRead');
      if (autoReadButton) {
        const spanElement = autoReadButton.querySelector('span');
        if (spanElement) {
          spanElement.textContent = 'Disable Auto Read Mode';
        }
      }
    }

    // Load click-read state from localStorage on popup open
    const savedClickRead = localStorage.getItem('clickRead');
    if (savedClickRead === 'true') {
      clickRead = true;
      const clickReadButton = document.getElementById('toggleclickRead');
      if (clickReadButton) {
        const spanElement = clickReadButton.querySelector('span');
        if (spanElement) {
          spanElement.textContent = 'Disable Click Read Mode';
        }
      }
    }

    // Function to stop reading
    function stopReading() {
      speechSynthesis.cancel(); // Cancel any ongoing speech
      clearInterval(autoReadInterval); // Clear auto read interval if active
      removeHighlight(); // Remove highlight from all paragraphs
      // Save the current index to localStorage
      localStorage.setItem('currentIndex', currentIndex);
    }

    function readText(paragraph) {
      // Scroll the highlighted paragraph into the center of the screen
      paragraph.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      const text = paragraph.innerText.trim();
      const chunks = splitText(text); // Split text into chunks

      let chunkIndex = 0; // Index for the chunks

      const readNextChunk = () => {
        if (chunkIndex < chunks.length) {
          const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);

          // Clear highlight when the reading ends
          utterance.onend = () => {
            chunkIndex++; // Move to the next chunk

            // Read the next chunk if there are more
            readNextChunk();
          };

          // Start speaking the current chunk
          speechSynthesis.speak(utterance);
        } else {
          // Move to the next paragraph after all chunks are read
          currentIndex++; // Move to the next paragraph after reading all chunks

          // Start reading the next paragraph only if auto read mode is active
          if (autoRead) {
            if (currentIndex >= autoParagraphs.length) {
              // currentIndex = 0; // Reset index to loop through
            }
            const nextParagraph = autoParagraphs[currentIndex];
            readText(nextParagraph); // Read the next paragraph
          }
        }
      };

      removeHighlight(); // Remove the highlight from the previous paragraph
      paragraph.classList.add('highlighted-paragraph'); // Highlight current paragraph
      readNextChunk(); // Start reading the first chunk

      // console.log('current index: ', currentIndex);
    }

    // Function to split text into manageable sentences/chunks
    function splitText(text) {
      const sentences = text.split(/(?<=[.!?])\s+/); // Split by sentence-ending punctuation followed by space
      const chunks = [];

      sentences.forEach((sentence) => {
        if (sentence.length > 200) {
          // If the sentence is longer than 200 characters, split by commas
          const commaChunks = sentence.split(',').map((chunk) => chunk.trim());
          chunks.push(...commaChunks); // Add the chunks to the main array
        } else {
          chunks.push(sentence.trim()); // Otherwise, just add the sentence
        }
      });

      return chunks;
    }

    // Function for Auto Read
    function startAutoRead() {
      if (autoReadInterval) return; // If already running, do nothing

      // Only get currentIndex from localStorage if it's not already set
      if (localStorage.getItem('currentIndex')) {
        currentIndex = parseInt(localStorage.getItem('currentIndex'), 10);
      }

      // Ensure currentIndex is valid
      if (currentIndex >= autoParagraphs.length) {
        currentIndex = 0;
      }

      // Make sure we have paragraphs to read
      if (autoParagraphs.length > 0) {
        const firstParagraph = autoParagraphs[currentIndex];
        if (firstParagraph) {
          readText(firstParagraph);
        }
      }
    }

    // Function to toggle Auto Read mode
    function toggleAutoRead() {
      autoRead = !autoRead;

      // Only update the span text if the button still exists in DOM
      const autoReadButton = document.getElementById('toggleAutoRead');
      if (autoReadButton) {
        const spanElement = autoReadButton.querySelector('span');
        if (spanElement) {
          spanElement.textContent = autoRead
            ? 'Disable Auto Read Mode'
            : 'Enable Auto Read Mode';
        }
      }

      // Save auto-read state to localStorage
      localStorage.setItem('autoRead', autoRead);

      if (autoRead) {
        // First stop any ongoing reading
        stopReading();

        // Disable Click Read Mode when Auto Read is enabled
        if (clickRead) {
          clickRead = false;
          localStorage.setItem('clickRead', clickRead);
          const clickReadButton = document.getElementById('toggleclickRead');
          if (clickReadButton) {
            const clickReadSpan = clickReadButton.querySelector('span');
            if (clickReadSpan) {
              clickReadSpan.textContent = 'Enable Click Read Mode';
            }
          }
          disableClickRead();
        }

        // Reset currentIndex if it's not set
        if (
          typeof currentIndex === 'undefined' ||
          currentIndex >= autoParagraphs.length
        ) {
          currentIndex = 0;
        }

        // Ensure paragraphs are refreshed
        refreshParagraphs();

        // Start auto reading with a small delay to ensure DOM is ready
        setTimeout(() => {
          startAutoRead();
        }, 100);
      } else {
        stopReading();
      }
    }

    // Function to toggle Click Read Mode
    function toggleclickRead() {
      clickRead = !clickRead;

      // Only update the span text if the button still exists in DOM
      const clickReadButton = document.getElementById('toggleclickRead');
      if (clickReadButton) {
        const spanElement = clickReadButton.querySelector('span');
        if (spanElement) {
          spanElement.textContent = clickRead
            ? 'Disable Click Read Mode'
            : 'Enable Click Read Mode';
        }
      }

      // Save click-read state to localStorage
      localStorage.setItem('clickRead', clickRead);

      if (clickRead) {
        // Disable Auto Read mode when Click Read is enabled
        if (autoRead) {
          autoRead = false;
          localStorage.setItem('autoRead', autoRead);
          const autoReadButton = document.getElementById('toggleAutoRead');
          if (autoReadButton) {
            const autoReadSpan = autoReadButton.querySelector('span');
            if (autoReadSpan) {
              autoReadSpan.textContent = 'Enable Auto Read Mode';
            }
          }
          stopReading();
        }
        enableClickRead();
      } else {
        disableClickRead();
        stopReading();
      }
    }

    // Function to enable click-to-read mode
    function enableClickRead() {
      paragraphs.forEach((paragraph) => {
        paragraph.addEventListener('click', handleClickToRead, true);
        // console.log('Click listener added to:', paragraph);
      });
    }

    // Function to handle click-to-read
    function handleClickToRead(event) {
      const paragraph = event.target;
      // console.log('Paragraph clicked:', event.target);

      // Stop reading if something is already being read
      stopReading();
      currentIndex = autoParagraphs.indexOf(paragraph); // Update currentIndex to this paragraph
      localStorage.setItem('currentIndex', currentIndex); // Save updated index
      readText(paragraph);
    }

    function refreshParagraphs() {
      autoParagraphs = Array.from(
        document.body.querySelectorAll('p, h1, h2, h3, h4, h5, ul, li')
      ).filter((element) => {
        return (
          !element.closest('header') &&
          !element.closest('nav') &&
          !element.closest('.menu') &&
          !element.closest('.footer') &&
          !element.closest('.accessibility-popup')
        );
      });
    }

    // Function to disable click-to-read mode
    function disableClickRead() {
      //   refreshParagraphs();
      //   console.log('disable click read mode is called');
      //   paragraphs.forEach((paragraph) => {
      //     paragraph.removeEventListener('click', handleClickToRead, true);
      //     console.log('Click listener removed from:', paragraph);
      //   });
      //   stopReading(); // Stop any ongoing reading when disabling click-to-read mode

      autoParagraphs.forEach((paragraph) => {
        const clone = paragraph.cloneNode(true);
        paragraph.replaceWith(clone);
      });
      stopReading(); // Stop any ongoing reading when disabling click-to-read mode
    }

    // Function to remove highlight from all paragraphs
    function removeHighlight() {
      autoParagraphs.forEach((paragraph) => {
        paragraph.classList.remove('highlighted-paragraph');
      });
    }

    document
      .getElementById('toggleclickRead')
      .addEventListener('click', toggleclickRead);
    document
      .getElementById('toggleAutoRead')
      .addEventListener('click', toggleAutoRead);

    // Accessibility features
    let fontSize = 100;
    let highContrast = false;

    const bodyElements = document.body.querySelectorAll(
      '*:not(.accessibility-popup):not(.accessibility-popup *)'
    ); // Exclude the tool popup and its children

    // Function to adjust font size of page content (excluding the tool)
    function adjustFontSize(increase = true) {
      bodyElements.forEach((element) => {
        const currentFontSize = window.getComputedStyle(element).fontSize;
        const newSize = increase
          ? parseFloat(currentFontSize) * 1.1
          : parseFloat(currentFontSize) / 1.1;
        element.style.fontSize = newSize + 'px';
      });
    }

    // Function to reset font size and contrast
    function resetAccessibility() {
      // Reset font size to 100%
      bodyElements.forEach((element) => {
        element.style.fontSize = ''; // Reset to default
      });

      // Reset contrast mode
      bodyElements.forEach((element) => {
        element.style.filter = 'none'; // Remove high contrast
      });

      // Reset internal variables
      fontSize = 100;
      highContrast = false;
    }

    // Event listener to increase font size
    document
      .getElementById('increaseFont')
      .addEventListener('click', () => adjustFontSize(true));

    // Event listener to decrease font size
    document
      .getElementById('decreaseFont')
      .addEventListener('click', () => adjustFontSize(false));

    // Toggle high contrast mode
    function toggleContrastMode() {
      bodyElements.forEach((element) => {
        element.style.filter = highContrast ? 'none' : 'contrast(200%)';
      });
      highContrast = !highContrast;
    }

    // Event listener for toggling contrast
    document
      .getElementById('toggleContrast')
      .addEventListener('click', toggleContrastMode);

    // Event listener for resetting both font size and contrast mode
    document
      .getElementById('resetTool')
      .addEventListener('click', resetAccessibility);

    // Add event listener for the donate button
    document.querySelector('.donate-button').addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent popup from closing
      window.open('https://webease-hub.web.app/donate', '_blank');
    });
  }
}

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
