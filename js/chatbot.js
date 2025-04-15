// Wait for DOM to fully load before accessing elements
document.addEventListener("DOMContentLoaded", function() {
  // Get DOM elements
  const sendBtn = document.getElementById("send-btn");
  const chatInput = document.getElementById("chat-input");
  const chatContent = document.getElementById("chat-content");
  const chatToggle = document.getElementById("chat-toggle");
  const chatBox = document.getElementById("chat-box");
  const mainSearchBtn = document.getElementById("main-search-btn");
  const mainSearch = document.getElementById("main-search");
  const mainResults = document.getElementById("main-results");
  // const categoryCards = document.querySelectorAll(".category-card");


  const categoryCards = document.querySelectorAll(".category-card"); // This will now select the <a> tags

categoryCards.forEach(card => {
    card.addEventListener("click", handleCategoryClick);
});
// Add event listeners to category cards
categoryCards.forEach(card => {
    card.addEventListener("click", handleCategoryClick);
});
  // Log elements to verify they're found
  console.log("Chat elements loaded:", {
    sendBtn, chatInput, chatContent, chatToggle, chatBox,
    mainSearchBtn, mainSearch, mainResults
  });

  // Toggle chatbot visibility
  if (chatToggle) {
    chatToggle.addEventListener("click", () => {
      console.log("Chat toggle clicked");
      chatBox.classList.toggle("show");
      chatToggle.classList.toggle("open");
    });
  }

  // Event listeners for chat functionality
  if (sendBtn && chatInput) {
    sendBtn.addEventListener("click", () => {
      console.log("Send button clicked");
      handleUserMessage();
    });

    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        console.log("Enter key pressed in chat input");
        handleUserMessage();
      }
    });
  }

  // Event listeners for main search
  if (mainSearchBtn && mainSearch) {
    mainSearchBtn.addEventListener("click", () => {
      console.log("Main search button clicked");
      handleMainSearch();
    });

    mainSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        console.log("Enter key pressed in main search");
        handleMainSearch();
      }
    });
  }

  // ScrapingDog Amazon API configuration
  const API_KEY = '67fe00534ff79a8d543a802b';
  const API_URL = 'https://api.scrapingdog.com/amazon/search';

  // Handle user message in chatbot
  function handleUserMessage() {
    if (!chatInput || !chatContent) return;

    const text = chatInput.value.trim();
    console.log("Processing user message:", text);

    if (!text) return;

    // Add user message to chat
    appendMessage(text, "user");
    chatInput.value = "";

    // Show typing indicator
    appendTypingIndicator();

    // Search for products
    searchAmazonProducts(text)
      .then(products => {
        // Remove typing indicator
        removeTypingIndicator();

        if (products && products.length > 0) {
          console.log("Products found:", products.slice(0, 3));
          // Display top 3 product recommendations
          appendMessage("Here are my top 3 recommendations for you:", "bot");

          // Get the first 3 products (or fewer if less available)
          const topThreeProducts = products.slice(0, 3);

          // Display each product
          topThreeProducts.forEach(product => {
            appendProductMessage(product);
          });
        } else {
          appendMessage("Sorry, I couldn't find any products matching your search.", "bot");
        }
      })
      .catch(error => {
        removeTypingIndicator();
        appendMessage("Sorry, there was an error searching for products. Please try again later.", "bot");
        console.error("API Error:", error);
      });
  }

  // Handle main search functionality
  function handleMainSearch() {
    if (!mainSearch || !mainResults) return;

    const query = mainSearch.value.trim();
    console.log("Processing main search:", query);

    if (!query) return;

    // Clear previous results
    mainResults.innerHTML = "";

    // Add loading indicator
    mainResults.innerHTML = "<div style='text-align:center;padding:20px;'>Searching...</div>";

    // Search for products
    searchAmazonProducts(query)
      .then(products => {
        console.log("Main search results:", products);

        // Get top 3 products for consistency with chatbot
        const topThreeProducts = products.slice(0, 3);

        // Display products in grid
        displayProductsInGrid(topThreeProducts);
      })
      .catch(error => {
        mainResults.innerHTML = "<div style='text-align:center;padding:20px;'>Error searching for products. Please try again.</div>";
        console.error("API Error:", error);
      });
  }

  // Search Amazon products using ScrapingDog API
  async function searchAmazonProducts(query) {
    console.log("Searching Amazon for:", query);

    try {
      // Construct the API URL with parameters
      const params = new URLSearchParams({
        api_key: API_KEY,
        query: query,
        page: '1',
        country: 'in', // Set country to India
        postal_code: '144411', // Example postal code for India
        domain: 'in'  // Set domain to Amazon India
      });
      const requestUrl = `${API_URL}?${params.toString()}`;

      console.log("Making API request to:", requestUrl);

      const response = await fetch(requestUrl);

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      console.log("API response data:", data);

      // Process the API response
      if (data && Array.isArray(data.products)) {
        return data.products.map(product => ({
          title: product.title || product.name || 'Product Name',
          price: product.price || product.price_string || 'Price not available',
          image: product.image || product.thumbnail || '',
          url: product.link || product.url || '#',
          rating: product.rating || 'N/A',
          description: product.description || ''
        }));
      } else if (data && data.results && Array.isArray(data.results)) {
        // Handle the 'results' array if 'products' is not present (based on ScrapingDog documentation)
        return extractProductData(data);
      }

      return [];
    } catch (error) {
      console.error("API Error:", error);
      throw error; // Re-throw the error to be caught by the calling function
    }
  }

  // Function to extract essential product data from the API response
  function extractProductData(apiResponse) {
    // Check if we have valid data
    if (!apiResponse || !apiResponse.results || !Array.isArray(apiResponse.results)) {
      console.error("Invalid API response format");
      return [];
    }

    // Extract essential details from each product
    const products = apiResponse.results.map(product => {
      // Only process search_product types
      if (product.type !== "search_product") return null;

      return {
        title: product.title || "Unknown Product",
        price: product.price_string || product.price || "Price not available",
        image: product.image || "",
        rating: product.stars || "N/A",
        url: product.optimized_url || product.url || "#",
        description: product.description || '' // Assuming description might be available
      };
    }).filter(product => product !== null);

    return products;
  }

  // Append message to chat
  function appendMessage(text, sender) {
    if (!chatContent) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    chatContent.appendChild(messageDiv);
    scrollToBottom();
  }

  // Add typing indicator
  function appendTypingIndicator() {
    if (!chatContent) return;

    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot typing";
    typingDiv.id = "typing-indicator";
    typingDiv.textContent = "Searching products";
    chatContent.appendChild(typingDiv);

    // Add animated dots
    const dotsSpan = document.createElement("span");
    dotsSpan.className = "dots";
    typingDiv.appendChild(dotsSpan);

    scrollToBottom();
  }

  // Remove typing indicator
  function removeTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Append product information to chat
  function appendProductMessage(product) {
    if (!chatContent) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = "message bot product-message";

    // Create product card for chat
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

  // Display products in main grid
  function displayProductsInGrid(products) {
    if (!mainResults) return;

    // Clear results
    mainResults.innerHTML = "";

    if (!products || products.length === 0) {
      mainResults.innerHTML = "<div style='text-align:center;padding:20px;'>No products found.</div>";
      return;
    }

    // Add class to enable grid layout
    mainResults.className = "product-grid";

    // Create product cards
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

      // Add click handler to open product page
      productCard.addEventListener("click", () => {
        window.open(product.url, "_blank");
      });

      mainResults.appendChild(productCard);
    });
  }

  // Helper function to truncate text
  function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  // Scroll chat to bottom
  function scrollToBottom() {
    if (chatContent) {
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  }
});


document.addEventListener("DOMContentLoaded", function() {
  // ... your existing chatbot.js code ...

  const popularProductsGrid = document.getElementById("popular-products-grid");

  function displayPopularProducts(products) {
      if (!popularProductsGrid) return;
      popularProductsGrid.innerHTML = ""; // Clear existing content

      products.forEach(product => {
          const productCard = document.createElement("div");
          productCard.className = "product-card";
          productCard.innerHTML = `
              <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/150'">
              <h3>${product.title}</h3>
              <p>${product.price}</p>
          `;
          popularProductsGrid.appendChild(productCard);
      });
  }

  // Hardcoded smartphone data with (hopefully) working image URLs
  const popularSmartphones = [
    {
        title: "Xiaomi 14 Pro",
        price: "₹79,999",
        image: "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-pro-1.jpg"
    },
    {
        title: "OnePlus 12",
        price: "₹64,999",
        image: "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-12-1.jpg"
    },
  {
      title: "OnePlus 13",
      price: "₹69,999",
      image: "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-13-1.jpg"
  },
];


  // Call displayPopularProducts with the hardcoded data
  displayPopularProducts(popularSmartphones);

  // ... rest of your chatbot.js code ...
});

async function handleCategoryClick(event) {
  event.preventDefault(); // Prevent the default navigation of the <a> tag

  const category = event.currentTarget.dataset.category;
  console.log("Category clicked:", category);

  if (category) {
      // Clear previous results
      const mainResults = document.getElementById("main-results");
      if (mainResults) {
          mainResults.innerHTML = "<div style='text-align:center;padding:20px;'>Searching for products in '" + category + "'...</div>";
          mainResults.className = ""; // Remove product-grid class temporarily

          try {
              const products = await searchAmazonProducts(category);
              if (products && products.length > 0) {
                  displayProductsInGrid(products.slice(0, 3)); // Display top 3
              } else {
                  mainResults.innerHTML = "<div style='text-align:center;padding:20px;'>No products found in '" + category + "'.</div>";
                  mainResults.className = "product-grid"; // Re-apply class if needed
              }
          } catch (error) {
              console.error("Error searching for category:", error);
              mainResults.innerHTML = "<div style='text-align:center;padding:20px;color:red;'>Error searching for products in this category. Please try again.</div>";
              mainResults.className = "product-grid"; // Re-apply class if needed
          }
      }
  }
}