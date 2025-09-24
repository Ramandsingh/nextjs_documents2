# Receipt Analyzer App

## Goal

This web application allows users to upload multiple receipt images simultaneously. It leverages the Moonshot AI API to analyze each receipt, extract key data, and display the results in a structured, interactive table.

## Features

- User authentication with a default username and password.
- Multi-file drag-and-drop interface for receipt image uploads.
- Integration with Moonshot AI API for intelligent receipt data extraction based on a detailed prompt.
- Dynamic display of extracted receipt data in a structured, Excel-friendly table format with banding and outlines.
- Improved UI layout and styling for better user experience.
- Robust error handling for API failures and malformed receipts.
- Optimized for deployment on Vercel.

## Technology Stack

- **Frontend:** Next.js (App Router), React, Shadcn UI
- **Backend:** OpenAI client library (for Moonshot AI), Next.js Server Actions
- **AI Model:** Moonshot AI (configurable via environment variables)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- Node.js (v18 or later)
- npm (or your preferred package manager like pnpm, yarn)

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd nextjs_documents
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

### Environment Variables

Create a `.env.local` file in the root of the project and add your API keys and configuration:

```
KIMI_API_KEY=your_moonshot_api_key_here
KIMI_BASE_URL=https://api.moonshot.ai/v1
KIMI_MODEL=your_moonshot_vision_model_name_here # e.g., moonshotai/kimi-k2-instruct (ensure it supports vision)

DEFAULT_USERNAME=your_default_username
DEFAULT_PASSWORD=your_default_password
```

Replace `your_moonshot_api_key_here`, `your_moonshot_vision_model_name_here`, `your_default_username`, and `your_default_password` with your actual values.

### Running Locally

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login) in your browser to log in and then access the application.

## Usage

1.  Navigate to the login page (`/login`).
2.  Log in with your configured default username and password.
3.  On the main page, drag and drop one or more receipt images into the designated upload area.
4.  Click 'Process Receipts'.
5.  The application will process the images using Moonshot AI, and the extracted data will be displayed in a table in an Excel-friendly format.

## Detailed AI Prompt

**Task:** Accurately extract structured information from receipt images and return it in a standardized JSON format. Ensure high accuracy even when receipts vary in format, language (including non-Latin scripts), and layout. Handle challenges like text noise, multiple lines for item names, and potential gaps in information.

**Receipts:** May be in various languages (Latin and non-Latin scripts), in diverse formats, and may contain noise like logos, faded text, or watermarks.

**Output Format:** Return the output as a JSON object with the following structure:

```json
{
    "store_name": string,
    "country": string,
    "receipt_type": string,
    "address": string,
    "datetime": "YYYY.MM.DD HH:MM:SS",
    "currency": string,
    "sub_total_amount": 0.00,
    "total_price": 0.00,
    "total_discount": 0.00,
    "all_items_price_with_tax": true/false,
    "payment_method": "card" | "cash" | "unknown",
    "rounding": 0.00,
    "tax": 0.00,
    "taxes_not_included_sum": 0.00,
    "tips": 0.00,
    "items": [
        {
            "name": string,
            "quantity": 0.000,
            "measurement_unit": string,
            "total_price_without_discount": 0.00,
            "unit_price": 0.00,
            "total_price_with_discount": 0.00,
            "discount": 0.00,
            "category": string,
            "item_price_with_tax": "True" | "False"
        }
    ],
    "taxs_items": [
        {
            "tax_name": string,
            "percentage": 0.00,
            "tax_from_amount": 0.00,
            "tax": 0.00,
            "total": 0.00,
            "tax_included": "True" | "False"
        }
    ]
}
```

**Additional Notes:**
1. If no receipt is detected: Return "Receipt not found."
2. Handle various languages (including non-Latin scripts) and keep text in the original script unless translation is explicitly required.
3. If information is missing or unclear, return "unknown" or "not available" for that field.
4. Extract the full name of each item. Some items may have names split across multiple lines; in this case, concatenate the lines until you encounter a quantity or unit of measurement (e.g., "2ks"), which marks the end of the item name.
5. Some receipts could be, for example, from McDonald`s restaurant, where in receipts under menu name could be written components of this menu. In this case you should extract only menu name.
6. The total amount may not always be the largest number; ensure the context is understood from surrounding text.
7. Tips and Charity Donations: Extract and sum tips and charity donations, storing the total under the tips field.
8. Convert datetime to the "YYYY.MM.DD HH:MM:SS" format, regardless of how they appear on the receipt (e.g., MM/DD/YY, DD-MM-YYYY).
9. Handle ambiguous data consistently. If there's ambiguity about price, quantity, or any other information, make the best effort to extract it, or return "unknown."
10. Be flexible in handling varied receipt layouts, item name formats, and currencies.
11. The unit_price/price/total_price/total_price_without_discount for an item can be negative
12. After the total amount may be information about taxes, in separate tax items. Define them in taxs_items
