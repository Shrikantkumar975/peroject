const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

sendBtn.addEventListener("click", handleUserMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleUserMessage();
});

function handleUserMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(text, "user-message");
  userInput.value = "";

  setTimeout(() => {
    botTypingEffect("Searching for product: " + text);
  }, 500);
}

function appendMessage(text, className) {
  const msg = document.createElement("div");
  msg.className = className;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function botTypingEffect(responseText) {
  const typing = document.createElement("div");
  typing.className = "bot-message";
  typing.textContent = "Typing...";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    typing.remove();
    appendMessage(responseText, "bot-message");
  }, 1000);
}
