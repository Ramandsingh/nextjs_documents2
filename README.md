# Receipt Analyzer App

This web application allows users to upload multiple receipt images simultaneously. It leverages the Moonshot AI API to analyze each receipt, extract key data, and display the results in a structured, interactive table.

## Features

-   **User Authentication:** Secure login with a default username and password.
-   **Multi-File Upload:** Drag-and-drop interface for easy receipt image uploads.
-   **AI-Powered Extraction:** Integrates with Moonshot AI for intelligent data extraction.
-   **Interactive Data Table:** Displays extracted data in a structured, Excel-friendly format.
-   **Robust Error Handling:** Manages API failures and malformed receipt data gracefully.
-   **Optimized for Vercel:** Ready for easy deployment.

## Technology Stack

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **UI:** [React](https://react.dev/), [Shadcn UI](https://ui.shadcn.com/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **AI Integration:** [OpenAI SDK](https://github.com/openai/openai-node) (for Moonshot AI compatibility)
-   **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

-   Node.js (v18 or later)
-   npm, pnpm, or yarn

### 1. Installation

First, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd nextjs_documents
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root of your project and add the following variables:

```env
KIMI_API_KEY="your_moonshot_api_key_here"
KIMI_BASE_URL="https://api.moonshot.ai/v1"
KIMI_MODEL="your_moonshot_vision_model_name_here" # e.g., moonshot-v1-32k

DEFAULT_USERNAME="your_default_username"
DEFAULT_PASSWORD="your_default_password"
```

### 3. Running the Development Server

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login) in your browser to log in and start using the application.

## Available Scripts

-   `npm run dev`: Starts the development server with Turbopack.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts the production server.
-   `npm run lint`: Runs the ESLint code linter.

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-repo%2Fnextjs_documents&env=KIMI_API_KEY,KIMI_BASE_URL,KIMI_MODEL,DEFAULT_USERNAME,DEFAULT_PASSWORD&envDescription=API%20keys%20and%20credentials%20for%20the%20Receipt%20Analyzer%20App)

Click the button above to deploy this project to Vercel. You will be prompted to enter the environment variables during the setup process.

<details>
<summary>AI Prompt Details</summary>

**Task:** Accurately extract structured information from receipt images and return it in a standardized JSON format.

**Output Format:** Return the output as a JSON object with the following structure:

```json
{
    "store_name": "string",
    "country": "string",
    "receipt_type": "string",
    "address": "string",
    "datetime": "YYYY.MM.DD HH:MM:SS",
    "currency": "string",
    "sub_total_amount": 0.00,
    "total_price": 0.00,
    "total_discount": 0.00,
    "all_items_price_with_tax": true,
    "payment_method": "card" | "cash" | "unknown",
    "rounding": 0.00,
    "tax": 0.00,
    "taxes_not_included_sum": 0.00,
    "tips": 0.00,
    "items": [
        {
            "name": "string",
            "quantity": 0.000,
            "measurement_unit": "string",
            "total_price_without_discount": 0.00,
            "unit_price": 0.00,
            "total_price_with_discount": 0.00,
            "discount": 0.00,
            "category": "string",
            "item_price_with_tax": "True" | "False"
        }
    ],
    "taxs_items": [
        {
            "tax_name": "string",
            "percentage": 0.00,
            "tax_from_amount": 0.00,
            "tax": 0.00,
            "total": 0.00,
            "tax_included": "True" | "False"
        }
    ]
}
```

**Key Instructions:**
1.  If no receipt is detected, return "Receipt not found."
2.  Handle multiple languages and scripts.
3.  Use "unknown" or "not available" for missing information.
4.  Concatenate multi-line item names.
5.  Extract only the main menu item name, not its components (e.g., for a McDonald's meal).
6.  Sum all tips and charity donations into the `tips` field.
7.  Standardize `datetime` to `YYYY.MM.DD HH:MM:SS`.
8.  Item prices can be negative (e.g., for returns).
9.  Define tax details in the `taxs_items` array.

</details>