import requests

url = "https://realtime-amazon-data.p.rapidapi.com/product-details?asin=B09J9X8DLR&country=IN"

querystring = {
    "query": "iPhone",
    "page": "1",
    "country": "IN",
    "sort_by": "LOWEST_PRICE",
    "product_condition": "ALL",
    "is_prime": "false",
    "deals_and_discounts": "NONE"
}

headers = {
    "x-rapidapi-host": "realtime-amazon-data.p.rapidapi.com",
    "x-rapidapi-key": "3e991feecfmsh090ad5d43bade33p1d5615jsn7c87c2c162dd"
}

response = requests.get(url, headers=headers, params=querystring)

# Show output clearly
if response.status_code == 200:
    data = response.json()
    print("\n✅ Success! Here's a sample product:\n")
    products = data.get("data", {}).get("products", [])
    if products:
        for i, product in enumerate(products[:3], 1):  # Show top 3
            print(f"📦 Product {i}:")
            print("Title:", product.get("title"))
            print("Price:", product.get("price"))
            print("URL:", product.get("url"))
            print()
    else:
        print("⚠️ No products found.")
else:
    print("❌ API call failed:", response.status_code)
    print(response.text)
