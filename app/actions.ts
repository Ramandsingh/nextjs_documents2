'use server';

import OpenAI from 'openai';

interface ReceiptData {
  store_name: string;
  country: string;
  receipt_type: string;
  address: string;
  datetime: string;
  currency: string;
  sub_total_amount: number | 'unknown';
  total_price: number;
  total_discount: number;
  all_items_price_with_tax: boolean | 'unknown';
  payment_method: 'card' | 'cash' | 'unknown';
  rounding: number;
  tax: number;
  taxes_not_included_sum: number;
  tips: number;
  items: Array<{
    name: string;
    quantity: number;
    measurement_unit: string;
    total_price_without_discount: number;
    unit_price: number;
    total_price_with_discount: number;
    discount: number;
    category: string;
    item_price_with_tax: boolean | 'True' | 'False';
  }>;
  taxs_items: Array<{
    tax_name: string;
    percentage: number;
    tax_from_amount: number;
    tax: number;
    total: number;
    tax_included: boolean | 'True' | 'False';
  }>;
}

export async function processReceipts(
  files: File[]
): Promise<{ processedData: ReceiptData[]; rawResponses: string[] }> {
  console.log('Server Action: processReceipts started.');
  const KIMI_API_KEY = process.env.KIMI_API_KEY;
  const KIMI_BASE_URL = process.env.KIMI_BASE_URL;
  const KIMI_MODEL = process.env.KIMI_MODEL || 'moonshotai/kimi-k2-instruct';

  if (!KIMI_API_KEY) {
    console.error('Server Action: KIMI_API_KEY is not set.');
    throw new Error('KIMI_API_KEY is not set.');
  }
  if (!KIMI_BASE_URL) {
    console.error('Server Action: KIMI_BASE_URL is not set.');
    throw new Error('KIMI_BASE_URL is not set.');
  }
  console.log('Server Action: KIMI_API_KEY is set.');
  console.log(`Server Action: Using Moonshot AI base URL: ${KIMI_BASE_URL}`);
  console.log(`Server Action: Using Moonshot AI model: ${KIMI_MODEL}`);

  const openai = new OpenAI({
    baseURL: KIMI_BASE_URL,
    apiKey: KIMI_API_KEY,
  });

  const processedData: ReceiptData[] = [];
  const rawAIResponses: string[] = [];
  let fileCount = 0;

  for (const file of files) {
    fileCount++;
    console.log(`Server Action: Processing file: ${file.name}, type: ${file.type}`);

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const prompt = `
      Task: Accurately extract structured information from receipt images and return it in a standardized JSON format. Ensure high accuracy even when receipts vary in format, language (including non-Latin scripts), and layout. Handle challenges like text noise, multiple lines for item names, and potential gaps in information.

      Receipts: May be in various languages (Latin and non-Latin scripts), in diverse formats, and may contain noise like logos, faded text, or watermarks.

      Output Format: Return the output as a JSON object with the following structure:

      {
          "store_name": string,  -- Exact name of the store as found on the receipt. It\`s not always the bigger text. Find the correct name of the shop/restaurant
          "country": string,  -- Define country if available; otherwise, "unknown". Identify country by details on the receipt. Use receipt address or language if explicit country info is lacking.
          "receipt_type": string,  -- Define receipt type (e.g. Restaurant/Shop/Other) if available; otherwise, "unknown"
          "address": string,  -- Full address, if available; otherwise, "unknown"
          "datetime": "YYYY.MM.DD HH:MM:SS",  -- Convert all date formats to this standard
          "currency": string,  -- Currency code (e.g., "EUR", "USD", "UAH") based on the detected currency symbol. Don\`t put here currency symbol, only code.
          "sub_total_amount": 0.00,  -- This represents the total cost of all items and services on the receipt before any tips, or additional charges are applied. If sub_total_amount is not present on the receipt, set "unknown"
          "total_price": 0.00,  -- The final total amount from the receipt (in the majority of situations this one is bigger then other values + it could be as bold font). The total amount may not always be the largest number; ensure the context is understood from surrounding text.
          "total_discount": 0.00,  -- Total discount applied based on individual item discounts or explicit discount information
          "all_items_price_with_tax": True/False -- Indicates whether taxes are included in the prices of items. Set to True if taxes are included, False if they are not included. If it cannot be determined, set to "unknown".
          "payment_method": "card", "cash", or "unknown",  -- Detect payment method based on keywords like "card", "cash", "master card", "visa", e.t. or if missing, use "unknown"
          "rounding": 0.00,  -- If rounding is not specified on the receipt, use 0.0
          "tax": 0.00,  -- If tax is not found or mentioned, use 0.0
          "taxes_not_included_sum": 0.0 -- Represents the total amount of taxes that are not included in the final total on the receipt. This is applicable in situations where taxes are itemized separately, such as in the United States. If there are no separate taxes, set to 0.0. 
          "tips": 0.00,  -- If tips is not found or mentioned, use 0.0
          "items": [
              {
                  "name": string,  -- Full item name (even if it spans multiple lines)
                  "quantity": 0.000,  -- Quantity of the item, default 1.0 if it wasn\`t written
                  "measurement_unit": string,  -- Use the format "ks", "kg", etc. If not specified, default to "ks"
                  "total_price_without_discount": 0.00, -- price without any discount for a single item. Always extract this value directly from the receipt
                  "unit_price": 0.00,  -- Price per unit without any discount, if available. If not, write here the same value as for total_price_without_discount. Can be negative
                  "total_price_with_discount": 0.00, -- This is the full price for a single item after considering all applicable discounts.
                  "discount": 0.00,  -- If discount isn\'t listed, assume 0.00
                  "category": string,  -- Category choose fromlist:Food,Beverages,Personal Care, Beauty & Health,Household Items,Electronics & Appliances,Clothing & Accessories,Home & Furniture,Entertainment & Media,Sports & Outdoors,Car,Baby Products,Stationery,Pet Supplies,Health & Fitness Services,Travel & Transportation,Insurance & Financial Services,Utilities,Gifts & Specialty Items,Services,Other options
                  "item_price_with_tax": string  -- "True"/"False". Indicating whether the item prices include tax.
              }
          ]
          "taxs_items": [
              {
                  "tax_name": string, -- The name of the tax or tax rate.
                  "percentage": 0.00, --The tax percentage.
                  "tax_from_amount": 0.00, -- The amount before tax.
                  "tax": 0.00, -- The tax amount itself.
                  "total": 0.00, -- The total amount including tax.
                  "tax_included": string  -- "True"/"False" indicating whether taxes are included in the item prices. Set to True if there is no separate line for tax on the receipt, or if it explicitly states that taxes are included. Otherwise, set to False
              }
          ]
      }

      #Additional Notes:
      1. If no receipt is detected: Return "Receipt not found."
      2. Handle various languages (including non-Latin scripts) and keep text in the original script unless translation is explicitly required.
      3. If information is missing or unclear, return "unknown" or "not available" for that field.
      4. Extract the full name of each item. Some items may have names split across multiple lines; in this case, concatenate the lines until you encounter a quantity or unit of measurement (e.g., "2ks"), which marks the end of the item name.
      5. Some receipts could be, for example, from McDonald\`s restaurant, where in receipts under menu name could be written components of this menu. In this case you should extract only menu name.
      6. The total amount may not always be the largest number; ensure the context is understood from surrounding text.
      7. Tips and Charity Donations: Extract and sum tips and charity donations, storing the total under the tips field.
      8. Convert datetime to the "YYYY.MM.DD HH:MM:SS" format, regardless of how they appear on the receipt (e.g., MM/DD/YY, DD-MM-YYYY).
      9. Handle ambiguous data consistently. If there\'s ambiguity about price, quantity, or any other information, make the best effort to extract it, or return "unknown."
      10. Be flexible in handling varied receipt layouts, item name formats, and currencies.
      11. The unit_price/price/total_price/total_price_without_discount for an item can be negative
      12. After the total amount may be information about taxes, in separate tax items. Define them in taxs_items
    `;
    console.log('Server Action: Prompt prepared.');

    try {
      console.log('Server Action: Calling OpenAI-compatible API...');
      const response = await openai.chat.completions.create({
        model: KIMI_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${file.type};base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2000, // Increased max_tokens for more detailed response
      });
      console.log('Server Action: OpenAI-compatible API call successful.');

      const responseText = response.choices[0]?.message?.content || '';
      rawAIResponses.push(responseText);
      console.log('Server Action: API raw response text:', responseText);

      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      let parsedData: ReceiptData | null = null;

      if (jsonMatch && jsonMatch[1]) {
        console.log('Server Action: Found JSON block, attempting to parse...');
        try {
          parsedData = JSON.parse(jsonMatch[1]);
          console.log('Server Action: Successfully parsed JSON from block.');
        } catch (jsonError) {
          console.error('Server Action: Failed to parse JSON from API response block:', jsonError);
        }
      } else {
        console.log('Server Action: No JSON block found, attempting to parse entire response as JSON...');
        try {
          parsedData = JSON.parse(responseText);
          console.log('Server Action: Successfully parsed entire response as JSON.');
        } catch (jsonError) {
          console.error('Server Action: Failed to parse direct response as JSON:', jsonError);
        }
      }

      if (parsedData) {
        processedData.push(parsedData);
        console.log('Server Action: Extracted receipt data:', parsedData);
      } else {
        console.warn('Server Action: Could not extract valid receipt data from API response for file:', file.name);
      }

    } catch (error) {
      console.error('Server Action: Error processing receipt with OpenAI-compatible API:', error);
    }
  }
  console.log(`Server Action: processReceipts finished. Processed ${fileCount} files.`);
  return { processedData, rawResponses: rawAIResponses };
}