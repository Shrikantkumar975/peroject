// WARNING: Storing API keys directly in frontend code is insecure.
// This is for LOCAL TESTING ONLY. Do not deploy this publicly or commit keys.
const GEMINI_API_KEY = 'AIzaSyBi28i26ftpcEo2aU9Ry_puNWv9iQ70V_U'; // <<<--- REPLACE WITH YOUR GEMINI API KEY
const SCRAPINGDOG_API_KEY = '67fe00534ff79a8d543a802b'; // <<<--- REPLACE WITH YOUR SCRAPINGDOG API KEY (NOTE: Renamed from API_KEY)

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const SCRAPINGDOG_API_URL = 'https://api.scrapingdog.com/amazon/search'; // Keep ScrapingDog URL

// --- Tool Definition for Gemini ---
const amazonSearchTool = {
  functionDeclarations: [{
    name: "searchAmazonProducts",
    description: "Searches Amazon India (amazon.in) for products based on a user query and returns a list of products with their title, price, rating, and URL.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: {
          type: "STRING",
          description: "The product search query (e.g., 'wireless earphones', 'running shoes size 10')"
        }
      },
      required: ["query"]
    }
  }]
};

// Keep track of the conversation history for context
let conversationHistory = [];

// Wait for DOM to fully load before accessing elements
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const sendBtn = document.getElementById("send-btn");
  const chatInput = document.getElementById("chat-input");
  const chatContent = document.getElementById("chat-content");
  const chatToggle = document.getElementById("chat-toggle");
  const chatBox = document.getElementById("chat-box");
  const mainSearchBtn = document.getElementById("main-search-btn");
  const mainSearch = document.getElementById("main-search");
  const mainResults = document.getElementById("main-results");
  const popularProductsGrid = document.getElementById("popular-products-grid");
  const categoryCards = document.querySelectorAll(".category-card");
  const dealsLink = document.getElementById("deals-link");

  // Toggle chatbot visibility
  if (chatToggle && chatBox) {
    chatToggle.addEventListener("click", () => {
      chatBox.classList.toggle("show");
      chatToggle.classList.toggle("open");
    });
  }

  // Chat functionality
  if (sendBtn && chatInput) {
    sendBtn.addEventListener("click", handleUserMessage);
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleUserMessage();
    });
  }

  // Main search functionality
  if (mainSearchBtn && mainSearch) {
    mainSearchBtn.addEventListener("click", handleMainSearch);
    mainSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleMainSearch();
    });
  }

  // Category click functionality
  if (categoryCards) {
    categoryCards.forEach((card) => {
      card.addEventListener("click", handleCategoryClick);
    });
  }

  // Add event listener for "Deals" link
  if (dealsLink) {
    dealsLink.addEventListener("click", handleDealsClick);
  } else {
    console.error("Deals link not found!");
  }

  // Handle user message
  function handleUserMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, "user");
    conversationHistory.push({ role: "user", parts: [{ text }] });
    chatInput.value = "";
    appendTypingIndicator("Thinking...");
    getGeminiResponse();
  }

  // Handle "Deals" link click
  async function handleDealsClick(event) {
    event.preventDefault();
    if (!mainResults) return;

    const dealsQuery = "today's deals";
    mainResults.innerHTML = `<div style='text-align:center;padding:20px;'>Searching for ${dealsQuery}...</div>`;
    try {
      const products = await searchAmazonProducts(dealsQuery);
      displayProductsInGrid(products.slice(0, 10));
    } catch (error) {
      mainResults.innerHTML = "<div style='text-align:center;padding:20px;color:red;'>Error finding deals. Please try again later.</div>";
    }
  }

  // Display products in grid
  function displayProductsInGrid(products) {
    if (!mainResults) return;
    mainResults.innerHTML = "";
    if (!products || products.length === 0) {
      mainResults.innerHTML = "<div style='text-align:center;padding:20px;'>No products found.</div>";
      return;
    }
    mainResults.className = "product-grid";
    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.innerHTML = `
        <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/150'">
        <div class="product-details">
          <h4>${truncateText(product.title, 50)}</h4>
          <p>${truncateText(product.description || "", 100)}</p>
          <strong>${product.price}</strong>
          <span class="source">Amazon</span>
        </div>
      `;
      productCard.addEventListener("click", () => {
        window.open(product.url, "_blank");
      });
      mainResults.appendChild(productCard);
    });
  }

  // Truncate text
  function truncateText(text, maxLength) {
    if (!text) return "";
    return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
  }

  // Scroll chat to bottom
  function scrollToBottom() {
    if (chatContent) {
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  }

  // Display popular products
  function displayPopularProducts(products) {
    if (!popularProductsGrid) return;
    popularProductsGrid.innerHTML = "";
    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.innerHTML = `
        <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/150'">
        <div class="pop-product-details">
          <h3>${product.title}</h3>
          <p>${product.price}</p>
        </div>
      `;
      if (product.url && product.url !== "#") {
        productCard.style.cursor = "pointer";
        productCard.addEventListener("click", () => window.open(product.url, "_blank"));
      }
      popularProductsGrid.appendChild(productCard);
    });
  }

  // Hardcoded popular products
  const popularSmartphones = [
    {
      title: "Xiaomi 14 Pro",
      price: "₹79,999",
      image: "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-pro-1.jpg",
      rating: "4.5 ★",
      url: "#",
    },
    {
      title: "OnePlus 12",
      price: "₹64,999",
      image: "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-12-1.jpg",
      rating: "4.7 ★",
      url: "#",
    },
    {
      title: "Samsung S24",
      price: "₹79,999",
      image: "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-5g-sm-s921-1.jpg",
      rating: "4.6 ★",
      url: "#",
    },
  ];

  // Display popular products
  if (popularProductsGrid) {
    displayPopularProducts(popularSmartphones);
  }
});

// --- Core Gemini Interaction Function (Handles Function Calling) ---
// --- Core Gemini Interaction Function (Corrected for Function Calling & History) ---
// --- Core Gemini Interaction Function (Corrected Structure & Model Name) ---
async function getGeminiResponse() {
  // Use the current state of conversationHistory directly
  const requestBody = {
    contents: conversationHistory,
    tools: [amazonSearchTool], // Include the tool definition
    // Optional: Add generationConfig or safetySettings here
  };

  console.log("Calling Gemini API with history:", JSON.stringify(conversationHistory, null, 2));
  console.log("Sending request body:", JSON.stringify(requestBody, null, 2));

  // ***** IMPORTANT: The try...catch block STARTS HERE, INSIDE the function *****
  try {
    // Use the corrected URL with the new (non-exposed) key and correct model
    const CURRENT_GEMINI_API_KEY = 'AIzaSyBi28i26ftpcEo2aU9Ry_puNWv9iQ70V_U'; // Use your NEW key
    const CORRECT_GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CURRENT_GEMINI_API_KEY}`; // Use 1.5-flash

    console.log("Sending request to Gemini:", CORRECT_GEMINI_API_URL); // Log the correct URL

    const response = await fetch(CORRECT_GEMINI_API_URL, { // Use the corrected URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    removeTypingIndicator(); // Remove indicator after fetch attempt

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", response.status, errorData);
      appendMessage(`Sorry, there was an error communicating with the AI (${response.status}). Check console.`, "bot");
      // Clean up history? Maybe remove last 'user' message if API failed? Optional.
      return; // Stop processing on error
    }

    const data = await response.json();
    console.log("Gemini API raw response:", data);

    if (!data.candidates || data.candidates.length === 0) {
         appendMessage("Sorry, I didn't get a valid response from the AI.", "bot");
         console.error("No candidates in Gemini response:", data);
         return;
    }

    const candidate = data.candidates[0];
    const finishReason = candidate.finishReason;

    // Check finishReason for issues (can happen even with valid content)
    if (finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS" && finishReason !== "TOOL_CODE" && finishReason !== "TOOL_USE") {
          appendMessage(`AI response stopped unexpectedly: ${finishReason}`, "bot");
          console.warn("Gemini finish reason:", finishReason, candidate.safetyRatings);
          return;
    }

    // Ensure content and parts exist before processing
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
          // Allow TOOL_CODE/TOOL_USE finish reason even with empty parts initially
          if (finishReason !== "TOOL_CODE" && finishReason !== "TOOL_USE") {
             appendMessage("Sorry, the AI response was empty or missing content.", "bot");
             console.error("Empty/missing content parts in Gemini response:", candidate);
          }
           // If finishReason indicates a function call, let the logic below handle it
           if (!responsePart.functionCall) return; // Exit if no function call and no text expected
    }

    // Prepare to add the model's response turn to history
    const modelResponseTurn = { role: "model", parts: [] };
    let callFunction = false; // Flag to check if we need to make a recursive call

    // Process parts (usually just one part for text or function call)
    for (const responsePart of candidate.content.parts) {
        if (responsePart.functionCall) {
            callFunction = true; // Set flag
            // Add the functionCall part to the model's turn
            modelResponseTurn.parts.push(responsePart);

            const functionCall = responsePart.functionCall;
            const functionName = functionCall.name;
            const functionArgs = functionCall.args;
            console.log(`Gemini requested function call: ${functionName}`, functionArgs);

            if (functionName === "searchAmazonProducts") {
                appendTypingIndicator("Searching Amazon.in...");
                try {
                    const query = functionArgs.query;
                    const productResults = await searchAmazonProducts(query); // Uses SCRAPINGDOG_API_KEY
                    console.log("Amazon search results:", productResults);

                    // --- Display product cards immediately ---
                    let productsDisplayed = false; // Flag to track if cards were shown
                    if (productResults && productResults.length > 0 && !productResults[0]?.error) {
                        appendMessage("Here are some results from Amazon.in:", "bot");
                        const productsToDisplay = productResults.slice(0, 3);
                        productsToDisplay.forEach(product => appendProductMessage(product));
                        productsDisplayed = true; // Set flag
                    } else if (productResults && productResults[0]?.error) {
                        appendMessage("There was an issue searching Amazon. Please try again.", "bot");
                    } else {
                        appendMessage("I couldn't find specific products on Amazon for that query.", "bot");
                    }
                    // --- End of displaying cards ---

                    // Now we just stop here after displaying the cards (or error message)
                    // No second call to Gemini is made.
                    removeTypingIndicator(); // Ensure indicator is removed

                    // History update: We should still add the model's function *request*
                    // The code that adds the modelResponseTurn before this try block handles that.
                    // We just won't add the function *response* or make the recursive call.

                } catch (error) {
                    // Catch errors specifically from executing searchAmazonProducts
                    removeTypingIndicator();
                    console.error("Error executing/processing searchAmazonProducts:", error);
                    appendMessage("Sorry, there was an internal error processing the Amazon search.", "bot");
                }
                // --- End of modified try block ---
            } else {
                // Handle unknown function calls (same as before)
                appendMessage(`Sorry, I don't know how to execute the function: ${functionName}`, "bot");
                // Add the model turn with the unknown function call request to history
                conversationHistory.push(modelResponseTurn);
            }
            break; // Assume only one function call per turn for now
        }
        else if (responsePart.text) {
            // Add the text part to the model's turn
            modelResponseTurn.parts.push(responsePart);
            const generatedText = responsePart.text;
            console.log("Gemini text response:", generatedText);
            appendMessage(generatedText, "bot");
            // No recursive call needed for simple text response
        } else {
             console.warn("Received unexpected part type:", responsePart);
        }
    } // End of loop through parts

    // Add the completed model turn to history IF it wasn't a function call
    // (Function call turns are added before the recursive call)
    if (!callFunction && modelResponseTurn.parts.length > 0) {
          conversationHistory.push(modelResponseTurn);
    }


  // ***** IMPORTANT: The try block ENDS HERE *****
  } catch (error) {
    // Generic catch block for fetch errors or unexpected issues
    removeTypingIndicator();
    console.error("Error in getGeminiResponse:", error);
    appendMessage("Sorry, an unexpected error occurred. Please check the console.", "bot");
  }
// ***** IMPORTANT: The function definition ENDS HERE *****
}

// --- Amazon Search Function (Uses ScrapingDog - Kept from user's code) ---
async function searchAmazonProducts(query) {
  console.log("Executing tool: Searching Amazon for:", query);

  try {
    const params = new URLSearchParams({
      api_key: SCRAPINGDOG_API_KEY, // Use correct key
      query: query,
      page: '1',
      country: 'in',
      domain: 'in'
    });
    const requestUrl = `${SCRAPINGDOG_API_URL}?${params.toString()}`;
    console.log("Making ScrapingDog API request to:", requestUrl);

    const response = await fetch(requestUrl);
    if (!response.ok) throw new Error(`ScrapingDog API responded with status ${response.status}`);
    const data = await response.json();
    console.log("ScrapingDog API response data:", data);

     // Process response (ensure this matches your actual ScrapingDog output)
     let products = [];
     if (data && Array.isArray(data.products)) {
         products = data.products.map(product => ({
             title: product.title || product.name || 'Product Name',
             price: product.price || product.price_string || 'Price N/A',
             image: product.image || product.thumbnail || '',
             url: product.link || product.url || '#',
             rating: product.rating || 'N/A',
             description: product.description || ''
         }));
     } else if (data && data.results && Array.isArray(data.results)) {
         products = extractProductData(data); // Use existing helper if format matches
     }

    console.log(`Found ${products.length} products via ScrapingDog`);
    return products; // Return the processed list

  } catch (error) {
    console.error("ScrapingDog API Error:", error);
    return [{ error: `Failed to search Amazon: ${error.message}` }]; // Return error structure for Gemini
  }
}

// Function to extract product data (Kept from user's code)
 function extractProductData(apiResponse) {
     if (!apiResponse || !apiResponse.results || !Array.isArray(apiResponse.results)) {
         console.error("Invalid API response format for extraction");
         return [];
     }
     const products = apiResponse.results.map(product => {
         if (product.type !== "search_product") return null;
         return {
             title: product.title || "Unknown Product",
             price: product.price_string || product.price || "Price N/A",
             image: product.image || "",
             rating: product.stars || "N/A",
             url: product.optimized_url || product.url || "#",
             description: product.description || ''
         };
     }).filter(product => product !== null);
     return products;
 }

// --- UI Helper Functions ---

// Append message to chat (Kept from user's code)
function appendMessage(text, sender) {
  if (!chatContent) return;
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;
  // Basic sanitization might be needed if text could contain HTML
  messageDiv.textContent = text;
  chatContent.appendChild(messageDiv);
  scrollToBottom();
}

// Add typing indicator (Modified slightly)
function appendTypingIndicator(message = "Thinking...") {
    if (!chatContent) return;
    // Remove existing before adding new one
    removeTypingIndicator();
    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot typing";
    typingDiv.id = "typing-indicator";
    typingDiv.textContent = message; // Use parameter
    const dotsSpan = document.createElement("span");
    dotsSpan.className = "dots"; // Make sure you have CSS for this animation
    typingDiv.appendChild(dotsSpan);
    chatContent.appendChild(typingDiv);
    scrollToBottom();
}

// Remove typing indicator (Kept from user's code)
function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Append product message to chat (Kept from user's code - NOT USED BY DEFAULT)
// This could be called manually after getting results if desired,
// but the default behavior is for Gemini to summarize.
function appendProductMessage(product) {
  if (!chatContent) return;
  const messageDiv = document.createElement("div");
  messageDiv.className = "message bot product-message";
  messageDiv.innerHTML = `
    <div class="bot-product-card">
      <img src="${product.image}" alt="${product.title}" class="product-img" onerror="this.src='https://via.placeholder.com/100'">
      <div class="product-info">
        <h4>${product.title}</h4>
        <p><strong>Price:</strong> ${product.price}</p>
        <p><strong>Rating:</strong> ${product.rating || 'N/A'}</p>
        <p><a href="${product.url}" target="_blank">View on Amazon</a></p>
      </div>
    </div>
  `;
  chatContent.appendChild(messageDiv);
  scrollToBottom();
}

// Display products in main grid (Kept from user's code)
function displayProductsInGrid(products) {
  if (!mainResults) return;
  mainResults.innerHTML = ""; // Clear
  if (!products || products.length === 0) {
    mainResults.innerHTML = "<div style='text-align:center;padding:20px;'>No products found.</div>";
    mainResults.className = ""; // Clear grid class
    return;
  }
  mainResults.className = "product-grid"; // Set grid class
  products.forEach(product => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/150'">
      <div class="product-details">
        <h4>${truncateText(product.title, 50)}</h4>
        <p>${truncateText(product.description || '', 100)}</p>
        <strong>${product.price}</strong>
        <span class="source">Amazon</span>
      </div>
    `;
    productCard.addEventListener("click", () => {
      window.open(product.url, "_blank");
    });
    mainResults.appendChild(productCard);
  });
}

// Helper function to truncate text (Kept from user's code)
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Scroll chat to bottom (Kept from user's code)
function scrollToBottom() {
  if (chatContent) {
    chatContent.scrollTop = chatContent.scrollHeight;
  }
}

// --- Main Search Handling (Kept from user's code - uses ScrapingDog directly) ---
function handleMainSearch() {
  if (!mainSearch || !mainResults) return;
  const query = mainSearch.value.trim();
  if (!query) return;
  mainResults.innerHTML = "<div style='text-align:center;padding:20px;'>Searching...</div>";
  mainResults.className = ""; // Clear grid class

  searchAmazonProducts(query) // Uses the same ScrapingDog function
    .then(products => {
      console.log("Main search results:", products);
      // Display products (adjust slice as needed)
      displayProductsInGrid(products.slice(0, 10)); // Show more in main grid maybe?
    })
    .catch(error => {
      mainResults.innerHTML = "<div style='text-align:center;padding:20px; color:red;'>Error searching for products. Please try again.</div>";
      mainResults.className = ""; // Clear grid class
      console.error("Main Search API Error:", error);
    });
}


// --- Category Click Handling (Kept from user's code - uses ScrapingDog directly) ---
async function handleCategoryClick(event) {
  event.preventDefault();
  const category = event.currentTarget.dataset.category;
  console.log("Category clicked:", category);

  if (category && mainResults) {
    mainResults.innerHTML = `<div style='text-align:center;padding:20px;'>Searching for products in '${category}'...</div>`;
    mainResults.className = ""; // Clear grid class

    try {
      const products = await searchAmazonProducts(category); // Uses same ScrapingDog function
      displayProductsInGrid(products.slice(0, 10)); // Show results in main grid
    } catch (error) {
      console.error("Error searching for category:", error);
      mainResults.innerHTML = "<div style='text-align:center;padding:20px;color:red;'>Error finding products in this category.</div>";
      mainResults.className = "";
    }
  }
}


// --- Popular Products Display (Kept from user's code) ---
 function displayPopularProducts(products) {
     if (!popularProductsGrid) return;
     popularProductsGrid.innerHTML = ""; // Clear existing

     products.forEach(product => {
         const productCard = document.createElement("div");
         productCard.className = "product-card"; // Use general card class
         // Using the simpler structure from user's provided code
         productCard.innerHTML = `
             <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/150'">
             <div class="pop-product-details">
                  <h3>${product.title}</h3>
                  <p>${product.price}</p>
              </div>
         `;
         // Optionally add click handler to open product.url if available
         if(product.url && product.url !== '#') {
             productCard.style.cursor = 'pointer';
             productCard.addEventListener('click', () => window.open(product.url, '_blank'));
         }
         popularProductsGrid.appendChild(productCard);
     });
 }

 // Hardcoded popular products (Kept from user's code, added URL/rating placeholders)
 const popularSmartphones = [
   {
       title: "Xiaomi 14 Pro",
       price: "₹79,999",
       image: "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-pro-1.jpg",
       rating: "4.5 ★", url: "#"
   },
   {
       title: "OnePlus 12",
       price: "₹64,999",
       image: "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-12-1.jpg",
       rating: "4.7 ★", url: "#"
   },
   {
       title: "Samsung S24", // Updated example
       price: "₹79,999",
       image: "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-5g-sm-s921-1.jpg",
       rating: "4.6 ★", url: "#"
   },
 ];

 // Call displayPopularProducts if grid exists
 if (popularProductsGrid) {
     displayPopularProducts(popularSmartphones);
 }

// }); // End of DOMContentLoaded