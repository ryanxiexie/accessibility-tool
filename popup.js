document.getElementById('injectToolIcon').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Inject both tool icon and the popup script
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: injectToolIconAndPopup,
    });
  });
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
  toolIconImg.src = chrome.runtime.getURL('images/tool-icon.png'); // Get the local image file
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
    // Check if the popup is already injected to avoid duplicates
    const existingPopup = document.querySelector('.accessibility-popup');
    if (existingPopup) return;

    // Inject CSS for popup
    const style = document.createElement('style');
    style.innerHTML = `
            .accessibility-popup {
                position: fixed;
                top: 0;
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
				transform: translateY(0%);
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
            .highlighted-paragraph {
                background-color: yellow;
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
            <button id="resetTool">Reset</button>
            <button id="toggleclickRead">Enable Click Read Mode</button>
            <button id="toggleAutoRead">Enable Auto Read</button>
        `;
    document.body.appendChild(popup);

    // Close button functionality
    document
      .querySelector('.accessibility-popup-close')
      .addEventListener('click', () => {
        popup.remove();
        document.removeEventListener('click', handleClickOutsidePopup); // Remove the event listener when popup is closed
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
      document.body.querySelectorAll('p, h1, h2, h3, li')
    ); // Collect paragraphs and headings

    // Collect paragraphs and headings, excluding menu and header elements
    let autoParagraphs = paragraphs.filter((element) => {
      return (
        !element.closest('header') &&
        !element.closest('.menu') &&
        !element.closest('.footer')
      );
    });

    // Load auto-read state from localStorage on popup open
    const savedAutoRead = localStorage.getItem('autoRead');

    // Load auto-read state from localStorage on popup open
    const savedClickRead = localStorage.getItem('clickRead');

    if (savedAutoRead === 'true') {
      autoRead = true;
      document.getElementById('toggleAutoRead').textContent =
        'Disable Auto Read';
    }

    if (savedClickRead === 'true') {
      clickRead = true;
      document.getElementById('toggleclickRead').textContent =
        'Disable Click Read Read';
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

      console.log('current index: ', currentIndex);
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

      // Start reading from the last known paragraph (currentIndex)
      const firstParagraph = autoParagraphs[currentIndex];
      readText(firstParagraph); // Start reading the paragraph at currentIndex
    }

    // Function to toggle Auto Read mode
    function toggleAutoRead() {
      autoRead = !autoRead; // Toggle auto read mode
      document.getElementById('toggleAutoRead').textContent = autoRead
        ? 'Disable Auto Read'
        : 'Enable Auto Read';

      // Save auto-read state to localStorage
      localStorage.setItem('autoRead', autoRead);

      if (autoRead) {
        stopReading(); // Stop any reading in progress

        // Disable Click Read Mode when Auto Read is enabled
        if (clickRead) {
          clickRead = false;
          localStorage.setItem('clickRead', clickRead);
          document.getElementById('toggleclickRead').textContent =
            'Enable Click Read Mode';
          disableClickRead(); // Disable click-to-read mode
        }

        startAutoRead(); // Start auto reading
      } else {
        stopReading(); // Stop any ongoing speech
        // Optionally, re-enable Click Read Mode here if needed
      }
    }

    // Function to toggle Click Read Mode
    function toggleclickRead() {
      clickRead = !clickRead;
      document.getElementById('toggleclickRead').textContent = clickRead
        ? 'Disable Click Read Mode'
        : 'Enable Click Read Mode';

      console.log('click read mode enable: ', clickRead);
      // Save auto-read state to localStorage
      localStorage.setItem('clickRead', clickRead);

      //   localStorage.setItem('currentIndex', currentIndex);

      if (clickRead) {
        // Disable Auto Read mode when Click Read is enabled
        if (autoRead) {
          autoRead = false;
          localStorage.setItem('autoRead', autoRead);
          document.getElementById('toggleAutoRead').textContent =
            'Enable Auto Read';
          stopReading(); // Stop any reading in progress
        }
        enableClickRead(); // Enable click-to-read mode
      } else {
        disableClickRead(); // Disable click-to-read mode
        stopReading(); // Stop any ongoing speech
      }
    }

    // Function to enable click-to-read mode
    function enableClickRead() {
      paragraphs.forEach((paragraph) => {
        paragraph.addEventListener('click', handleClickToRead, true);
        console.log('Click listener added to:', paragraph);
      });
    }

    // Function to handle click-to-read
    function handleClickToRead(event) {
      const paragraph = event.target;
      console.log('Paragraph clicked:', event.target);

      // Stop reading if something is already being read
      stopReading();
      currentIndex = autoParagraphs.indexOf(paragraph); // Update currentIndex to this paragraph
      localStorage.setItem('currentIndex', currentIndex); // Save updated index
      readText(paragraph);
    }

    function refreshParagraphs() {
      autoParagraphs = Array.from(
        document.body.querySelectorAll('p, h1, h2, h3, li')
      ).filter((element) => {
        return (
          !element.closest('header') &&
          !element.closest('.menu') &&
          !element.closest('.footer')
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
  }
}
