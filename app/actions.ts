'use server';

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';

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
  console.log('--- GEMINI CLI DEBUG: processReceipts v4 START ---');
  console.log('Server Action: processReceipts started.');

  // Get environment variables
  const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
  const KIMI_API_KEY = process.env.KIMI_API_KEY;
  const KIMI_BASE_URL = process.env.KIMI_BASE_URL;
  console.log(`Server Action: KIMI_BASE_URL loaded: ${KIMI_BASE_URL}`);
  console.log(`Server Action: KIMI_API_KEY loaded: ${KIMI_API_KEY ? `...${KIMI_API_KEY.slice(-4)}` : 'Not Set'}`);
  const KIMI_MODEL = process.env.KIMI_MODEL || 'moonshotai/kimi-k2-instruct';
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

  // Check if we should use demo mode
  const isGeminiConfigured = GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
  const isMoonshotConfigured = KIMI_API_KEY && KIMI_API_KEY !== 'your_moonshot_api_key_here';
  const forceDemoMode = process.env.FORCE_DEMO_MODE === 'true';

  const isDemoMode = (!isGeminiConfigured && !isMoonshotConfigured) || forceDemoMode;

  console.log(`Server Action: Using AI Provider: ${AI_PROVIDER}`);
  console.log(`Server Action: Gemini configured: ${isGeminiConfigured}`);
  console.log(`Server Action: Moonshot configured: ${isMoonshotConfigured}`);
  console.log(`Server Action: Force demo mode: ${forceDemoMode}`);

  if (isDemoMode) {
    console.log('Server Action: Running in DEMO MODE - returning sample data.');

    const demoReceipts: ReceiptData[] = [];

    // Return demo data based on number of files uploaded
    if (files.length >= 1) {
      // First receipt - Blue Water Grill
      demoReceipts.push({
        store_name: 'Blue Water Grill',
        country: 'Australia',
        receipt_type: 'Restaurant',
        address: '10 Santa Barbara Rd, Hope Island, QLD, 4212',
        datetime: '2025.03.27 14:31:00',
        currency: 'AUD',
        sub_total_amount: 23.59,
        total_price: 25.95,
        total_discount: 0.00,
        all_items_price_with_tax: true,
        payment_method: 'card',
        rounding: 0.00,
        tax: 2.36,
        taxes_not_included_sum: 0.00,
        tips: 0.00,
        items: [
          {
            name: '$24.95 Lunch Special',
            quantity: 1.0,
            measurement_unit: 'ks',
            total_price_without_discount: 24.95,
            unit_price: 24.95,
            total_price_with_discount: 24.95,
            discount: 0.00,
            category: 'Food',
            item_price_with_tax: true
          },
          {
            name: 'Chilli Flakes (Serve)',
            quantity: 1.0,
            measurement_unit: 'ks',
            total_price_without_discount: 1.00,
            unit_price: 1.00,
            total_price_with_discount: 1.00,
            discount: 0.00,
            category: 'Food',
            item_price_with_tax: true
          }
        ],
        taxs_items: [
          {
            tax_name: 'GST',
            percentage: 10.00,
            tax_from_amount: 23.59,
            tax: 2.36,
            total: 25.95,
            tax_included: true
          }
        ]
      });
    }

    if (files.length >= 2) {
      // Second receipt - Coffee Shop
      demoReceipts.push({
        store_name: 'The Coffee Bean & Tea Leaf',
        country: 'United States',
        receipt_type: 'Cafe',
        address: '123 Main St, Los Angeles, CA 90210',
        datetime: '2025.03.28 09:15:00',
        currency: 'USD',
        sub_total_amount: 12.45,
        total_price: 13.58,
        total_discount: 2.00,
        all_items_price_with_tax: true,
        payment_method: 'card',
        rounding: 0.00,
        tax: 1.13,
        taxes_not_included_sum: 0.00,
        tips: 2.50,
        items: [
          {
            name: 'Large Cappuccino',
            quantity: 1.0,
            measurement_unit: 'ks',
            total_price_without_discount: 5.95,
            unit_price: 5.95,
            total_price_with_discount: 5.95,
            discount: 0.00,
            category: 'Beverages',
            item_price_with_tax: true
          },
          {
            name: 'Blueberry Muffin',
            quantity: 1.0,
            measurement_unit: 'ks',
            total_price_without_discount: 4.50,
            unit_price: 4.50,
            total_price_with_discount: 2.50,
            discount: 2.00,
            category: 'Food',
            item_price_with_tax: true
          },
          {
            name: 'Extra Shot Espresso',
            quantity: 2.0,
            measurement_unit: 'ks',
            total_price_without_discount: 2.00,
            unit_price: 1.00,
            total_price_with_discount: 2.00,
            discount: 0.00,
            category: 'Beverages',
            item_price_with_tax: true
          }
        ],
        taxs_items: [
          {
            tax_name: 'Sales Tax',
            percentage: 9.75,
            tax_from_amount: 11.45,
            tax: 1.13,
            total: 13.58,
            tax_included: true
          }
        ]
      });
    }

    const responses = demoReceipts.map((_, index) =>
      `Demo mode: Sample data generated for receipt ${index + 1}`
    );

    return {
      processedData: demoReceipts,
      rawResponses: responses
    };
  }

  // Validate API configurations
  if (AI_PROVIDER === 'gemini' && !isGeminiConfigured) {
    console.error('Server Action: GEMINI_API_KEY is not set.');
    throw new Error('GEMINI_API_KEY is not set.');
  }
  if (AI_PROVIDER === 'moonshot' && (!isMoonshotConfigured || !KIMI_BASE_URL)) {
    console.error('Server Action: Moonshot AI configuration incomplete.');
    throw new Error('Moonshot AI configuration incomplete.');
  }

  // Initialize AI clients
  const gemini = isGeminiConfigured ? new GoogleGenerativeAI(GEMINI_API_KEY!) : null;
  const openai = isMoonshotConfigured && KIMI_BASE_URL ? new OpenAI({
    baseURL: KIMI_BASE_URL,
    apiKey: KIMI_API_KEY,
  }) : null;

  console.log(`Server Action: Using ${AI_PROVIDER.toUpperCase()} API for processing`);

  const processedData: ReceiptData[] = [];
  const rawResponses: string[] = [];
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
          "store_name": string,  -- Exact name of the store as found on the receipt. It's not always the bigger text. Find the correct name of the shop/restaurant
          "country": string,  -- Define country if available; otherwise, "unknown". Identify country by details on the receipt. Use receipt address or language if explicit country info is lacking.
          "receipt_type": string,  -- Define receipt type (e.g. Restaurant/Shop/Pharmacy/Other) if available; otherwise, "unknown"
          "address": string,  -- Full address, if available; otherwise, "unknown"
          "datetime": "YYYY.MM.DD HH:MM:SS",  -- Convert all date formats to this standard
          "currency": string,  -- Currency code (e.g., "EUR", "USD", "UAH") based on the detected currency symbol. Don't put here currency symbol, only code.
          "sub_total_amount": 0.00,  -- This represents the total cost of all items and services on the receipt before any tips, or additional charges are applied. If sub_total_amount is not present on the receipt, set "unknown"
          "total_price": 0.00,  -- The final total amount from the receipt (in the majority of situations this one is bigger then other values + it could be as bold font). The total amount may not always be the largest number; ensure the context is understood from surrounding text.
          "total_discount": 0.00,  -- Total discount applied based on individual item discounts or explicit discount information
          "all_items_price_with_tax": true/false -- Indicates whether taxes are included in the prices of items. Set to true if taxes are included, false if they are not included. If it cannot be determined, set to "unknown".
          "payment_method": "card", "cash", or "unknown",  -- Detect payment method based on keywords like "card", "cash", "master card", "visa", etc. or if missing, use "unknown"
          "rounding": 0.00,  -- If rounding is not specified on the receipt, use 0.0
          "tax": 0.00,  -- If tax is not found or mentioned, use 0.0
          "taxes_not_included_sum": 0.0 -- Represents the total amount of taxes that are not included in the final total on the receipt. This is applicable in situations where taxes are itemized separately, such as in the United States. If there are no separate taxes, set to 0.0.
          "tips": 0.00,  -- If tips is not found or mentioned, use 0.0
          "items": [
              {
                  "name": string,  -- Full item name (even if it spans multiple lines)
                  "quantity": 0.000,  -- Quantity of the item, default 1.0 if it wasn't written
                  "measurement_unit": string,  -- Use the format "ks", "kg", etc. If not specified, default to "ks"
                  "total_price_without_discount": 0.00, -- price without any discount for a single item. Always extract this value directly from the receipt
                  "unit_price": 0.00,  -- Price per unit without any discount, if available. If not, write here the same value as for total_price_without_discount. Can be negative
                  "total_price_with_discount": 0.00, -- This is the full price for a single item after considering all applicable discounts.
                  "discount": 0.00,  -- If discount isn't listed, assume 0.00
                  "category": string,  -- Category choose fromlist:Food,Beverages,Personal Care,Beauty & Health,Household Items,Electronics & Appliances,Clothing & Accessories,Home & Furniture,Entertainment & Media,Sports & Outdoors,Car,Baby Products,Stationery,Pet Supplies,Health & Fitness Services,Travel & Transportation,Insurance & Financial Services,Utilities,Gifts & Specialty Items,Services,Other options
                  "item_price_with_tax": "True"/"False"  -- Indicating whether the item prices include tax.
              }
          ],
          "taxs_items": [
              {
                  "tax_name": string, -- The name of the tax or tax rate.
                  "percentage": 0.00, --The tax percentage.
                  "tax_from_amount": 0.00, -- The amount before tax.
                  "tax": 0.00, -- The tax amount itself.
                  "total": 0.00, -- The total amount including tax.
                  "tax_included": "True"/"False"  -- indicating whether taxes are included in the item prices. Set to True if there is no separate line for tax on the receipt, or if it explicitly states that taxes are included. Otherwise, set to False
              }
          ]
      }

      IMPORTANT: Return ONLY the JSON object, no additional text or formatting.
    `;
    console.log('Server Action: Prompt prepared.');

    try {
      let responseText = '';

      if (AI_PROVIDER === 'gemini' && gemini) {
        console.log('Server Action: Calling Gemini API...');
        const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64,
              mimeType: file.type,
            },
          },
        ]);

        const response = result.response;
        console.log('Server Action: Full Gemini API response object:', JSON.stringify(response, null, 2));
        responseText = response.text();
        console.log('Server Action: Gemini API call successful.');

      } else if (AI_PROVIDER === 'kimi' && openai) {
        console.log('Server Action: Calling Moonshot API...');
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
          max_tokens: 2000,
        });

        console.log('Server Action: Full Moonshot API response object:', JSON.stringify(response, null, 2));
        responseText = response.choices[0]?.message?.content || '';
        console.log('Server Action: Moonshot API call successful.');
      }

      rawResponses.push(responseText);
      console.log('Server Action: Full API raw response:', responseText);

      // Try to parse JSON from response
      let parsedData: ReceiptData | null = null;

      if (responseText) {
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);

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
            // Try to extract JSON from response that might have extra text
            const jsonStart = responseText.indexOf('{');
            const jsonEnd = responseText.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
              try {
                const extractedJson = responseText.substring(jsonStart, jsonEnd + 1);
                parsedData = JSON.parse(extractedJson);
                console.log('Server Action: Successfully parsed extracted JSON.');
              } catch (extractError) {
                console.error('Server Action: Failed to parse extracted JSON:', extractError);
              }
            }
          }
        }
      } else {
        console.log('Server Action: API response is empty.');
      }

      if (parsedData) {
        processedData.push(parsedData);
        console.log('Server Action: Extracted receipt data:', parsedData);
      } else {
        console.warn('Server Action: Could not extract valid receipt data from API response for file:', file.name);
      }

    } catch (error) {
      console.error(`Server Action: Error processing receipt with ${AI_PROVIDER.toUpperCase()} API:`, JSON.stringify(error, null, 2));

      // Log detailed error information for debugging
      if (error instanceof Error) {
        console.error(`Server Action: Error message: ${error.message}`);
        console.error(`Server Action: Error name: ${error.name}`);
        console.error(`Server Action: Error stack: ${error.stack}`);

        // Check for specific Gemini model errors
        if (error.message.includes('404') || error.message.includes('not found')) {
          console.error(`Server Action: Model ${GEMINI_MODEL} not found or not accessible`);
        }
        if (error.message.includes('403') || error.message.includes('forbidden')) {
          console.error(`Server Action: API key may be invalid or lacking permissions`);
        }
      }

      // Check if it's a quota error
      if (error instanceof Error && error.message.includes('quota')) {
        console.log('Server Action: Quota exceeded, falling back to demo mode for this file');

        // Add a demo receipt based on the file name
        const demoReceipt: ReceiptData = {
          store_name: file.name.includes('pharmacy') || file.name.includes('Pharmacy') ? 'Local Pharmacy' :
                     file.name.includes('coffee') || file.name.includes('Coffee') ? 'Coffee Shop' :
                     file.name.includes('restaurant') || file.name.includes('Restaurant') ? 'Restaurant' :
                     'Demo Store (Quota Exceeded)',
          country: 'unknown',
          receipt_type: file.name.includes('pharmacy') || file.name.includes('Pharmacy') ? 'Pharmacy' :
                       file.name.includes('coffee') || file.name.includes('Coffee') ? 'Cafe' : 'Shop',
          address: 'Address not available (API quota exceeded)',
          datetime: new Date().toISOString().replace('T', ' ').slice(0, 19).replace(/-/g, '.'),
          currency: 'USD',
          sub_total_amount: 'unknown',
          total_price: 0.00,
          total_discount: 0.00,
          all_items_price_with_tax: 'unknown',
          payment_method: 'unknown',
          rounding: 0.00,
          tax: 0.00,
          taxes_not_included_sum: 0.00,
          tips: 0.00,
          items: [{
            name: 'Items not available (API quota exceeded)',
            quantity: 1.0,
            measurement_unit: 'ks',
            total_price_without_discount: 0.00,
            unit_price: 0.00,
            total_price_with_discount: 0.00,
            discount: 0.00,
            category: 'Other',
            item_price_with_tax: 'False'
          }],
          taxs_items: []
        };

        processedData.push(demoReceipt);
        rawResponses.push(`API quota exceeded for file: ${file.name}. Please upgrade your Gemini API plan or wait for quota reset.`);
      }
    }
  }
  console.log(`Server Action: processReceipts finished. Processed ${fileCount} files.`);
  return { processedData, rawResponses };
}

// Authentication server actions
export async function checkAuthentication(): Promise<boolean> {
  const sessionId = (await cookies()).get('session')?.value;
  return sessionId === 'default-user-id';
}

export async function performLogout(): Promise<void> {
  (await cookies()).delete('session');
}