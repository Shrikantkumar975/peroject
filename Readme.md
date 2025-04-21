# CompareCart

CompareCart is a web application that helps users compare prices across top Indian stores, track discounts, and make smarter buying decisions with AI-powered assistance. It features a chatbot for product recommendations, a search bar for finding products, and a categorized product display.

## Features

- **Search Products**: Search for products using the search bar or chatbot.
- **Chatbot Assistance**: Get product recommendations and interact with the chatbot for a conversational shopping experience.
- **Popular Categories**: Browse popular categories like Smartphones, Fashion, Laptops, and more.
- **Dynamic Product Display**: View search results and popular products dynamically rendered on the page.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## File Structure

project/ │ ├── index.html # Main HTML file ├── css/ │ └── style.css # Stylesheet for the application ├── js/ │ └── chatbot.js # JavaScript file for chatbot and dynamic functionality ├── images/ # Folder for images used in the application └── README.md # Documentation file

## How It Works

### 1. **Search Functionality**
- Users can search for products using the search bar or chatbot.
- The search queries are sent to the ScrapingDog Amazon API to fetch product data.
- Results are displayed dynamically in the `main-results` section or chatbot.

### 2. **Chatbot**
- A floating chatbot button toggles the chatbot interface.
- Users can type queries, and the chatbot responds with product recommendations.
- The chatbot displays product cards with images, prices, ratings, and links to Amazon.

### 3. **Popular Products**
- Hardcoded popular products are displayed in the `popular-products-grid` section.
- Each product card includes an image, title, and price.

### 4. **Category Browsing**
- Users can click on category cards to search for products in specific categories.
- Results are displayed dynamically in the `main-results` section.

## Technologies Used

- **HTML**: For structuring the web page.
- **CSS**: For styling the application.
- **JavaScript**: For dynamic functionality and chatbot interactions.
- **ScrapingDog API**: For fetching product data from Amazon.

## Setup Instructions

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/comparecart.git
    ```

2. Navigate to the project directory
    ```bash
    cd comparecart
    ```

3. Open index.html in your browser to view the application.

## API Configuration

The application uses the ScrapingDog Amazon API. To configure the API:

1. Replace the API_KEY in chatbot.js with your ScrapingDog API key:
   ```javascript
   const API_KEY = 'your-api-key';
   ```

2. Ensure the API URL is correct:
   ```javascript
   const API_URL = 'https://api.scrapingdog.com/amazon/search';
   ```

## Future Enhancements

- Integrate more e-commerce platforms for price comparison.
- Implement a backend for storing user preferences and search history.
- Add user authentication for personalized recommendations.

