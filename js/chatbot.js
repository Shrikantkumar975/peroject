// chatbot.js

// DOM Elements
const chatToggle = document.getElementById("chat-toggle");
const chatBox = document.getElementById("chat-box");
const chatContent = document.getElementById("chat-content");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const mainSearchBtn = document.getElementById("main-search-btn");
const mainSearch = document.getElementById("main-search");

// Toggle Chatbot Visibility
chatToggle.addEventListener("click", () => {
  chatBox.classList.toggle("show");
  const icon = chatToggle.querySelector("i");
  icon.classList.toggle("fa-robot");
  icon.classList.toggle("fa-comment-dots");
  icon.style.transform = chatBox.classList.contains("show") ? "rotate(-15deg)" : "rotate(0deg)";
});

// Append Message (User or Bot)
function appendMessage(sender, message, isHTML = false) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}`;
  msgDiv.innerHTML = isHTML ? message : `<p>${message}</p>`;
  chatContent.appendChild(msgDiv);
  chatContent.scrollTop = chatContent.scrollHeight;
}

// Show Typing Animation
function showTyping() {
  const typing = document.createElement("div");
  typing.className = "message bot typing";
  typing.innerHTML = "<i>Typing...</i>";
  chatContent.appendChild(typing);
  chatContent.scrollTop = chatContent.scrollHeight;
  return typing;
}

// Display Static Product Card
function displayProductCard(target = "chatbot") {
  const card = `
    <div class="product-card">
      <img src="https://m.media-amazon.com/images/I/61nzPMNY8zL._AC_UY327_FMwebp_QL65_.jpg" alt="iPhone 14 Pro">
      <div class="product-details">
        <h4>Apple iPhone 14 Pro (256GB) - Space Black</h4>
        <p>Super Retina XDR display, A16 Bionic chip, Pro camera system</p>
        <strong>₹1,19,999</strong>
        <span class="source">From: Amazon</span>
      </div>
    </div>
  `;
  if (target === "chatbot") {
    appendMessage("bot", card, true);
  } else {
    document.getElementById("main-results").innerHTML = card;
  }
}

// Handle Chatbot Send Button
sendBtn.addEventListener("click", handleUserInput);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleUserInput();
});

function handleUserInput() {
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;
  appendMessage("user", userMsg);
  chatInput.value = "";

  const typing = showTyping();

  setTimeout(() => {
    typing.remove();

    if (userMsg.toLowerCase().includes("price") || userMsg.toLowerCase().includes("buy")) {
      fetchAmazonProducts(userMsg, "chatbot");
    } else {
      appendMessage("bot", "Try something like 'buy iPhone' or 'laptop price'.");
    }
  }, 1000);
}

// Main Search
mainSearchBtn.addEventListener("click", handleMainSearch);
mainSearch.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleMainSearch();
});

function handleMainSearch() {
  const query = mainSearch.value.trim();
  if (!query) return;
  document.getElementById("main-results").innerHTML = ""; // Clear previous
  fetchAmazonProducts(query, "main");
}

// Fetch Amazon Products
async function fetchAmazonProducts(query, target = "chatbot") {
  const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&country=IN&sort_by=LOWEST_PRICE&product_condition=ALL&is_prime=false&deals_and_discounts=NONE`;

  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com",
      "x-rapidapi-key": "3e991feecfmsh090ad5d43bade33p1d5615jsn7c87c2c162dd"
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(result); // Debug log

    if (result?.data?.products?.length) {
      result.data.products.slice(0, 3).forEach(product => {
        const img = product.thumbnail || "https://via.placeholder.com/150";
        const title = product.title || "No Title";
        const price = product.price || "Price N/A";
        const link = product.url || "#";
    
        const card = `
          <div class="product-card">
            <img src="${img}" alt="${title}">
            <div class="product-details">
              <h4>${title}</h4>
              <strong>${price}</strong>
              <span class="source">From: Amazon</span><br>
              <a href="${link}" target="_blank">View</a>
            </div>
          </div>
        `;
        if (target === "chatbot") appendMessage("bot", card, true);
        else document.getElementById("main-results").innerHTML += card;
      });
    } else {
      appendMessage("bot", "No Amazon products found.");
    }
    
  } catch (err) {
    console.error(err);
    appendMessage("bot", "Amazon fetch error.");
  }
}

