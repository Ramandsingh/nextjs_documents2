import * as React from "react";
import {
  TableRow,
} from "@/components/ui/table";

interface Item {
  name: string;
  quantity: number;
  measurement_unit: string;
  total_price_without_discount: number;
  unit_price: number;
  total_price_with_discount: number;
  discount: number;
  category: string;
  item_price_with_tax: boolean | 'True' | 'False';
}

interface TaxItem {
  tax_name: string;
  percentage: number;
  tax_from_amount: number;
  tax: number;
  total: number;
  tax_included: boolean | 'True' | 'False';
}

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
  items: Item[];
  taxs_items: TaxItem[];
}

interface ReceiptTableProps {
  data: ReceiptData[];
}

// Export functions
const exportToCSV = (data: ReceiptData[]) => {
  // Create receipt-level CSV (one row per receipt)
  const csvContent = [
    // Headers
    'Receipt ID,Store Name,Country,Receipt Type,Address,Date,Currency,Total Amount,Tax Amount,Tax Rate %,Discount Amount,Tips Amount,Payment Method,Items Count,Top Categories',
    // Data rows - one row per receipt
    ...data.map((receipt, index) => {
      const taxRate = receipt.tax && receipt.total_price ? ((receipt.tax / (receipt.total_price - receipt.tax)) * 100).toFixed(1) : '0.0';

      // Get top categories for this receipt
      const categoryMapping: Record<string, string> = {
        'Food': 'Meals & Entertainment',
        'Beverages': 'Meals & Entertainment',
        'Personal Care': 'Employee & HR Expenses',
        'Beauty & Health': 'Employee & HR Expenses',
        'Household Items': 'Office Supplies',
        'Electronics & Appliances': 'Office Equipment',
        'Clothing & Accessories': 'Uniforms & Workwear',
        'Home & Furniture': 'Office Equipment',
        'Entertainment & Media': 'Marketing & Advertising',
        'Sports & Outdoors': 'Employee & HR Expenses',
        'Car': 'Travel & Transportation',
        'Baby Products': 'Employee & HR Expenses',
        'Stationery': 'Office Supplies',
        'Pet Supplies': 'Miscellaneous',
        'Health & Fitness Services': 'Employee & HR Expenses',
        'Travel & Transportation': 'Travel & Transportation',
        'Insurance & Financial Services': 'Financial & Banking',
        'Utilities': 'Operational & Office Expenses',
        'Gifts & Specialty Items': 'Employee Recognition & Gifts',
        'Services': 'Professional Services',
        'Other': 'Miscellaneous'
      };

      const categories = [...new Set((receipt.items || []).map(item =>
        categoryMapping[item.category] || 'Miscellaneous'
      ))].join('; ');

      return [
        `R${index + 1}`,
        `"${receipt.store_name}"`,
        `"${receipt.country}"`,
        `"${receipt.receipt_type}"`,
        `"${receipt.address}"`,
        `"${receipt.datetime}"`,
        receipt.currency,
        receipt.total_price,
        receipt.tax || 0,
        taxRate,
        receipt.total_discount || 0,
        receipt.tips || 0,
        receipt.payment_method,
        receipt.items?.length || 0,
        `"${categories}"`
      ].join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `receipt-summary-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportDetailedCSV = (data: ReceiptData[]) => {
  // Create detailed item-level CSV (one row per item)
  const csvContent = [
    // Headers
    'Receipt ID,Store Name,Country,Receipt Type,Address,Date,Currency,Receipt Total,Receipt Tax,Receipt Discount,Receipt Tips,Payment Method,Item Name,Item Category,Enterprise Category,Item Quantity,Item Unit Price,Item Total,Item Discount,Tax Included',
    // Data rows - one row per item
    ...data.flatMap((receipt, receiptIndex) =>
      (receipt.items || []).map(item => {
        const categoryMapping: Record<string, string> = {
          'Food': 'Meals & Entertainment',
          'Beverages': 'Meals & Entertainment',
          'Personal Care': 'Employee & HR Expenses',
          'Beauty & Health': 'Employee & HR Expenses',
          'Household Items': 'Office Supplies',
          'Electronics & Appliances': 'Office Equipment',
          'Clothing & Accessories': 'Uniforms & Workwear',
          'Home & Furniture': 'Office Equipment',
          'Entertainment & Media': 'Marketing & Advertising',
          'Sports & Outdoors': 'Employee & HR Expenses',
          'Car': 'Travel & Transportation',
          'Baby Products': 'Employee & HR Expenses',
          'Stationery': 'Office Supplies',
          'Pet Supplies': 'Miscellaneous',
          'Health & Fitness Services': 'Employee & HR Expenses',
          'Travel & Transportation': 'Travel & Transportation',
          'Insurance & Financial Services': 'Financial & Banking',
          'Utilities': 'Operational & Office Expenses',
          'Gifts & Specialty Items': 'Employee Recognition & Gifts',
          'Services': 'Professional Services',
          'Other': 'Miscellaneous'
        };

        return [
          `R${receiptIndex + 1}`,
          `"${receipt.store_name}"`,
          `"${receipt.country}"`,
          `"${receipt.receipt_type}"`,
          `"${receipt.address}"`,
          `"${receipt.datetime}"`,
          receipt.currency,
          receipt.total_price,
          receipt.tax,
          receipt.total_discount,
          receipt.tips,
          receipt.payment_method,
          `"${item.name}"`,
          `"${item.category}"`,
          `"${categoryMapping[item.category] || 'Miscellaneous'}"`,
          item.quantity,
          item.unit_price,
          item.total_price_with_discount,
          item.discount,
          item.item_price_with_tax === true ? 'Yes' : 'No'
        ].join(',');
      })
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `item-details-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToJSON = (data: ReceiptData[]) => {
  const jsonContent = JSON.stringify({
    exported_date: new Date().toISOString(),
    total_receipts: data.length,
    total_amount: data.reduce((sum, r) => sum + r.total_price, 0),
    receipts: data
  }, null, 2);

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `receipt-data-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToPDF = (data: ReceiptData[]) => {
  // Enterprise category mapping
  const categoryMapping: Record<string, string> = {
    // Office & Operational
    'Office Supplies': 'Office & Operational Expenses > Office Supplies',
    'Stationery': 'Office & Operational Expenses > Office Supplies',
    'Paper Products': 'Office & Operational Expenses > Office Supplies',
    'Writing Materials': 'Office & Operational Expenses > Office Supplies',
    'Filing & Organization': 'Office & Operational Expenses > Office Supplies',
    'Office Equipment': 'Office & Operational Expenses > Office Equipment & Technology',
    'Electronics & Appliances': 'Office & Operational Expenses > Office Equipment & Technology',
    'Computer Hardware': 'Office & Operational Expenses > Office Equipment & Technology',
    'Software & Licenses': 'Office & Operational Expenses > Software Subscriptions & Licenses',
    'Software Subscriptions & Licenses': 'Office & Operational Expenses > Software Subscriptions & Licenses',
    'Digital Tools': 'Office & Operational Expenses > Software Subscriptions & Licenses',
    'SaaS Subscriptions': 'Office & Operational Expenses > Software Subscriptions & Licenses',
    'Utilities': 'Office & Operational Expenses > Utilities & Facility Costs',
    'Internet & Communication': 'Office & Operational Expenses > Utilities & Facility Costs',
    'Phone Services': 'Office & Operational Expenses > Utilities & Facility Costs',
    'Facility Maintenance': 'Office & Operational Expenses > Utilities & Facility Costs',
    'Home & Furniture': 'Office & Operational Expenses > Office Equipment & Technology',
    'Office Furniture': 'Office & Operational Expenses > Office Equipment & Technology',

    // Employee & HR
    'Salaries & Wages': 'Employee & HR Expenses > Salaries & Wages',
    'Benefits & Insurance': 'Employee & HR Expenses > Benefits & Insurance',
    'Health Insurance': 'Employee & HR Expenses > Benefits & Insurance',
    'Retirement Plans': 'Employee & HR Expenses > Benefits & Insurance',
    'Training & Development': 'Employee & HR Expenses > Training & Development',
    'Professional Development': 'Employee & HR Expenses > Training & Development',
    'Conferences & Workshops': 'Employee & HR Expenses > Training & Development',
    'Recruitment & Hiring': 'Employee & HR Expenses > Recruitment & Hiring',
    'Job Boards & Advertising': 'Employee & HR Expenses > Recruitment & Hiring',
    'Background Checks': 'Employee & HR Expenses > Recruitment & Hiring',
    'Employee Recognition & Gifts': 'Employee & HR Expenses > Employee Recognition & Gifts',
    'Gifts & Specialty Items': 'Employee & HR Expenses > Employee Recognition & Gifts',
    'Team Building Activities': 'Employee & HR Expenses > Employee Recognition & Gifts',
    'Employee Perks': 'Employee & HR Expenses > Employee Recognition & Gifts',
    'Uniforms & Workwear': 'Employee & HR Expenses > Uniforms & Workwear',
    'Clothing & Accessories': 'Employee & HR Expenses > Uniforms & Workwear',
    'Safety Equipment': 'Employee & HR Expenses > Uniforms & Workwear',
    'Personal Care': 'Employee & HR Expenses > Employee Wellness',
    'Beauty & Health': 'Employee & HR Expenses > Employee Wellness',
    'Health & Fitness Services': 'Employee & HR Expenses > Employee Wellness',
    'Wellness Programs': 'Employee & HR Expenses > Employee Wellness',
    'Baby Products': 'Employee & HR Expenses > Employee Wellness',
    'Sports & Outdoors': 'Employee & HR Expenses > Employee Wellness',

    // Travel & Transportation
    'Travel & Transportation': 'Travel & Transportation > Transportation',
    'Airfare': 'Travel & Transportation > Transportation',
    'Car': 'Travel & Transportation > Transportation',
    'Vehicle Expenses': 'Travel & Transportation > Transportation',
    'Fuel & Gas': 'Travel & Transportation > Transportation',
    'Car Rentals': 'Travel & Transportation > Transportation',
    'Public Transportation': 'Travel & Transportation > Transportation',
    'Taxi & Ride Sharing': 'Travel & Transportation > Transportation',
    'Parking & Tolls': 'Travel & Transportation > Transportation',
    'Accommodations': 'Travel & Transportation > Accommodations',
    'Hotels & Lodging': 'Travel & Transportation > Accommodations',

    // Meals & Entertainment
    'Food': 'Meals & Entertainment > Business Meals',
    'Beverages': 'Meals & Entertainment > Business Meals',
    'Client Meals': 'Meals & Entertainment > Business Meals',
    'Team Meals': 'Meals & Entertainment > Business Meals',
    'Restaurant Expenses': 'Meals & Entertainment > Business Meals',
    'Catering': 'Meals & Entertainment > Business Meals',
    'Entertainment & Media': 'Meals & Entertainment > Client Entertainment',
    'Client Entertainment': 'Meals & Entertainment > Client Entertainment',
    'Corporate Events': 'Meals & Entertainment > Client Entertainment',

    // Marketing & Sales
    'Marketing & Advertising': 'Marketing & Sales > Marketing & Advertising',
    'Digital Marketing': 'Marketing & Sales > Marketing & Advertising',
    'Print Advertising': 'Marketing & Sales > Marketing & Advertising',
    'Trade Shows & Events': 'Marketing & Sales > Trade Shows & Events',
    'Promotional Materials': 'Marketing & Sales > Trade Shows & Events',
    'Sales Materials': 'Marketing & Sales > Sales Tools & Materials',
    'Customer Acquisition': 'Marketing & Sales > Sales Tools & Materials',

    // Professional Services
    'Services': 'Professional Services > Consulting & Advisory',
    'Professional Services': 'Professional Services > Consulting & Advisory',
    'Consulting & Advisory': 'Professional Services > Consulting & Advisory',
    'Legal Services': 'Professional Services > Legal Services',
    'Accounting & Tax': 'Professional Services > Accounting & Tax Services',
    'Financial Services': 'Professional Services > Accounting & Tax Services',
    'Insurance & Financial Services': 'Professional Services > Insurance & Risk Management',
    'Insurance & Risk Management': 'Professional Services > Insurance & Risk Management',

    // Operations & Maintenance
    'Equipment Maintenance': 'Operations & Maintenance > Equipment Maintenance & Repairs',
    'Repairs & Maintenance': 'Operations & Maintenance > Equipment Maintenance & Repairs',
    'Cleaning & Janitorial': 'Operations & Maintenance > Cleaning & Janitorial Services',
    'Security Services': 'Operations & Maintenance > Security & Safety',
    'Waste Management': 'Operations & Maintenance > Waste Management & Recycling',

    // Financial & Banking
    'Financial & Banking': 'Financial & Banking > Banking & Transaction Fees',
    'Banking Fees': 'Financial & Banking > Banking & Transaction Fees',
    'Loan Payments': 'Financial & Banking > Loan Payments & Interest',
    'Interest Expenses': 'Financial & Banking > Loan Payments & Interest',
    'Investment Management': 'Financial & Banking > Investment & Treasury',

    // Compliance & Regulatory
    'Licenses & Permits': 'Compliance & Regulatory > Licenses & Permits',
    'Regulatory Compliance': 'Compliance & Regulatory > Regulatory Fees & Compliance',
    'Tax Payments': 'Compliance & Regulatory > Tax Payments (excluding Income Tax)',
    'Audit & Compliance': 'Compliance & Regulatory > Audit & Professional Compliance',

    // Research & Development
    'R&D Equipment': 'Research & Development > R&D Equipment & Materials',
    'Research Materials': 'Research & Development > R&D Equipment & Materials',
    'Innovation Projects': 'Research & Development > Innovation & Patent Costs',
    'Patents & IP': 'Research & Development > Innovation & Patent Costs',
    'Product Development': 'Research & Development > Product Development Costs',

    // Quality & Testing
    'Quality Control': 'Quality & Testing > Quality Control & Assurance',
    'Testing & Certification': 'Quality & Testing > Testing & Certification',
    'Laboratory Services': 'Quality & Testing > Laboratory & Analysis Services',

    // Inventory & Supply Chain
    'Raw Materials': 'Inventory & Supply Chain > Raw Materials & Components',
    'Inventory': 'Inventory & Supply Chain > Inventory & Stock Management',
    'Shipping & Logistics': 'Inventory & Supply Chain > Shipping & Logistics',
    'Warehouse Costs': 'Inventory & Supply Chain > Warehouse & Storage',

    // Customer Support
    'Customer Support': 'Customer Support & Relations > Customer Support Services',
    'CRM Systems': 'Customer Support & Relations > CRM & Customer Management',
    'Customer Communications': 'Customer Support & Relations > Customer Communications',

    // Environmental & Sustainability
    'Environmental Compliance': 'Environmental & Sustainability > Environmental Compliance',
    'Sustainability Initiatives': 'Environmental & Sustainability > Sustainability Programs',
    'Green Technology': 'Environmental & Sustainability > Green Technology & Equipment',

    // Miscellaneous
    'Pet Supplies': 'Miscellaneous > Miscellaneous Business Expenses',
    'Other': 'Miscellaneous > Miscellaneous Business Expenses',
    'Charitable Donations': 'Miscellaneous > Charitable Contributions & Sponsorships',
    'Community Relations': 'Miscellaneous > Charitable Contributions & Sponsorships'
  };

  // Calculate category breakdown
  const categoryTotals = data.reduce((acc, receipt) => {
    receipt.items?.forEach(item => {
      const enterpriseCategory = categoryMapping[item.category] || 'Miscellaneous';
      acc[enterpriseCategory] = (acc[enterpriseCategory] || 0) + item.total_price_with_discount;
    });
    return acc;
  }, {} as Record<string, number>);

  // Calculate vendor breakdown
  const vendorTotals = data.reduce((acc, receipt) => {
    acc[receipt.store_name] = (acc[receipt.store_name] || 0) + receipt.total_price;
    return acc;
  }, {} as Record<string, number>);

  const totalAmount = data.reduce((sum, r) => sum + r.total_price, 0);
  const totalTax = data.reduce((sum, r) => sum + (r.tax || 0), 0);
  const totalTips = data.reduce((sum, r) => sum + (r.tips || 0), 0);
  const totalDiscounts = data.reduce((sum, r) => sum + (r.total_discount || 0), 0);

  const reportContent = `
====================================
        ENTERPRISE EXPENSE REPORT
====================================
Generated: ${new Date().toLocaleDateString()}
Report Period: ${data.length > 0 ? `${data[0].datetime} to ${data[data.length-1].datetime}` : 'N/A'}

EXECUTIVE SUMMARY:
- Total Receipts: ${data.length}
- Total Amount: ${totalAmount.toFixed(2)}
- Total Tax: ${totalTax.toFixed(2)} (${((totalTax / totalAmount) * 100).toFixed(1)}%)
- Total Tips: ${totalTips.toFixed(2)}
- Total Discounts: ${totalDiscounts.toFixed(2)}
- Average Receipt: ${(totalAmount / data.length).toFixed(2)}

EXPENSE CATEGORIES:
${Object.entries(categoryTotals)
  .sort(([,a], [,b]) => b - a)
  .map(([category, amount]) =>
    `- ${category}: ${amount.toFixed(2)} (${((amount / totalAmount) * 100).toFixed(1)}%)`
  ).join('\n')}

TOP VENDORS:
${Object.entries(vendorTotals)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([vendor, amount]) =>
    `- ${vendor}: ${amount.toFixed(2)} (${((amount / totalAmount) * 100).toFixed(1)}%)`
  ).join('\n')}

DETAILED RECEIPTS:
${data.map((receipt, index) => `
Receipt #${index + 1}: ${receipt.store_name}
  Date: ${receipt.datetime}
  Amount: ${receipt.currency} ${receipt.total_price}
  Tax: ${receipt.tax}
  Location: ${receipt.address}
  Payment: ${receipt.payment_method}
  Items: ${receipt.items?.length || 0}

  Items Detail:
${(receipt.items || []).map(item =>
  `    • ${item.name} - ${item.quantity} x ${item.unit_price} = ${item.total_price_with_discount}`
).join('\n')}
`).join('\n')}

====================================
End of Report
====================================
  `;

  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `enterprise-expense-report-${new Date().toISOString().split('T')[0]}.txt`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Duplicate detection function
const detectDuplicates = (receipts: ReceiptData[]) => {
  const duplicates: Array<{
    indices: number[];
    reason: string;
    confidence: 'high' | 'medium' | 'low';
    receipts: ReceiptData[];
  }> = [];

  for (let i = 0; i < receipts.length; i++) {
    for (let j = i + 1; j < receipts.length; j++) {
      const receipt1 = receipts[i];
      const receipt2 = receipts[j];

      // Check for exact duplicates
      if (receipt1.store_name === receipt2.store_name &&
          receipt1.total_price === receipt2.total_price &&
          receipt1.datetime === receipt2.datetime) {
        duplicates.push({
          indices: [i, j],
          reason: 'Identical store, amount, and datetime',
          confidence: 'high',
          receipts: [receipt1, receipt2]
        });
        continue;
      }

      // Check for likely duplicates (same store, amount, close time)
      if (receipt1.store_name === receipt2.store_name &&
          receipt1.total_price === receipt2.total_price) {
        // Check if dates are within 1 hour of each other
        const date1 = new Date(receipt1.datetime.replace(/\./g, '-'));
        const date2 = new Date(receipt2.datetime.replace(/\./g, '-'));
        const timeDiff = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60); // hours

        if (timeDiff <= 1) {
          duplicates.push({
            indices: [i, j],
            reason: 'Same store, amount, and time within 1 hour',
            confidence: 'high',
            receipts: [receipt1, receipt2]
          });
          continue;
        }
      }

      // Check for potential duplicates (same store, similar amount)
      if (receipt1.store_name === receipt2.store_name) {
        const amountDiff = Math.abs(receipt1.total_price - receipt2.total_price);
        const avgAmount = (receipt1.total_price + receipt2.total_price) / 2;
        const percentDiff = (amountDiff / avgAmount) * 100;

        if (percentDiff <= 5) { // Within 5% difference
          duplicates.push({
            indices: [i, j],
            reason: `Same store, amount differs by ${percentDiff.toFixed(1)}%`,
            confidence: 'medium',
            receipts: [receipt1, receipt2]
          });
        }
      }

      // Check for item-level similarity
      const items1 = receipt1.items || [];
      const items2 = receipt2.items || [];

      if (items1.length > 0 && items2.length > 0) {
        const commonItems = items1.filter(item1 =>
          items2.some(item2 =>
            item1.name.toLowerCase() === item2.name.toLowerCase() &&
            item1.total_price_with_discount === item2.total_price_with_discount
          )
        );

        const similarity = (commonItems.length / Math.max(items1.length, items2.length)) * 100;

        if (similarity >= 80) {
          duplicates.push({
            indices: [i, j],
            reason: `${similarity.toFixed(0)}% identical items`,
            confidence: similarity >= 90 ? 'high' : 'medium',
            receipts: [receipt1, receipt2]
          });
        }
      }
    }
  }

  // Remove duplicate entries (same pair detected multiple ways)
  const uniqueDuplicates = duplicates.reduce((acc, dup) => {
    const key = dup.indices.sort().join('-');
    if (!acc.some(existing => existing.indices.sort().join('-') === key)) {
      acc.push(dup);
    }
    return acc;
  }, [] as typeof duplicates);

  return uniqueDuplicates;
};

export function ReceiptTable({ data }: ReceiptTableProps) {
  const [activeTab, setActiveTab] = React.useState(0);
  const [showSummary, setShowSummary] = React.useState(data.length > 1);
  const [showDuplicates, setShowDuplicates] = React.useState(true);

  // Reset state when new data comes in
  React.useEffect(() => {
    setActiveTab(0);
    setShowSummary(data.length > 1);
    setShowDuplicates(true);
  }, [data]);

  // Ensure activeTab is within bounds
  const safeActiveTab = Math.max(0, Math.min(activeTab, data.length - 1));

  // Detect duplicates
  const duplicates = React.useMemo(() => detectDuplicates(data), [data]);

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">No receipt data to display</p>
        <p className="text-slate-400 dark:text-slate-500">Process some receipts to see the results here</p>
      </div>
    );
  }

  // Calculate comprehensive summary data
  const totalAmount = data.reduce((sum, receipt) => sum + receipt.total_price, 0);
  const currencies = [...new Set(data.map(receipt => receipt.currency))];
  const countries = [...new Set(data.map(receipt => receipt.country))];
  const totalItems = data.reduce((sum, receipt) => sum + (receipt.items?.length || 0), 0);

  // HR/Business Analytics
  const totalTax = data.reduce((sum, receipt) => sum + (receipt.tax || 0), 0);
  const totalTips = data.reduce((sum, receipt) => sum + (receipt.tips || 0), 0);
  const totalDiscounts = data.reduce((sum, receipt) => sum + (receipt.total_discount || 0), 0);
  const averageReceiptAmount = data.length > 0 ? totalAmount / data.length : 0;

  // Enterprise category mapping
  const categoryMapping: Record<string, string> = {
    // Office & Operational
    'Office Supplies': 'Office & Operational Expenses > Office Supplies',
    'Stationery': 'Office & Operational Expenses > Office Supplies',
    'Paper Products': 'Office & Operational Expenses > Office Supplies',
    'Writing Materials': 'Office & Operational Expenses > Office Supplies',
    'Filing & Organization': 'Office & Operational Expenses > Office Supplies',
    'Office Equipment': 'Office & Operational Expenses > Office Equipment & Technology',
    'Electronics & Appliances': 'Office & Operational Expenses > Office Equipment & Technology',
    'Computer Hardware': 'Office & Operational Expenses > Office Equipment & Technology',
    'Software & Licenses': 'Office & Operational Expenses > Software Subscriptions & Licenses',
    'Software Subscriptions & Licenses': 'Office & Operational Expenses > Software Subscriptions & Licenses',
    'Digital Tools': 'Office & Operational Expenses > Software Subscriptions & Licenses',
    'SaaS Subscriptions': 'Office & Operational Expenses > Software Subscriptions & Licenses',
    'Utilities': 'Office & Operational Expenses > Utilities & Facility Costs',
    'Internet & Communication': 'Office & Operational Expenses > Utilities & Facility Costs',
    'Phone Services': 'Office & Operational Expenses > Utilities & Facility Costs',
    'Facility Maintenance': 'Office & Operational Expenses > Utilities & Facility Costs',
    'Home & Furniture': 'Office & Operational Expenses > Office Equipment & Technology',
    'Office Furniture': 'Office & Operational Expenses > Office Equipment & Technology',

    // Employee & HR
    'Salaries & Wages': 'Employee & HR Expenses > Salaries & Wages',
    'Benefits & Insurance': 'Employee & HR Expenses > Benefits & Insurance',
    'Health Insurance': 'Employee & HR Expenses > Benefits & Insurance',
    'Retirement Plans': 'Employee & HR Expenses > Benefits & Insurance',
    'Training & Development': 'Employee & HR Expenses > Training & Development',
    'Professional Development': 'Employee & HR Expenses > Training & Development',
    'Conferences & Workshops': 'Employee & HR Expenses > Training & Development',
    'Recruitment & Hiring': 'Employee & HR Expenses > Recruitment & Hiring',
    'Job Boards & Advertising': 'Employee & HR Expenses > Recruitment & Hiring',
    'Background Checks': 'Employee & HR Expenses > Recruitment & Hiring',
    'Employee Recognition & Gifts': 'Employee & HR Expenses > Employee Recognition & Gifts',
    'Gifts & Specialty Items': 'Employee & HR Expenses > Employee Recognition & Gifts',
    'Team Building Activities': 'Employee & HR Expenses > Employee Recognition & Gifts',
    'Employee Perks': 'Employee & HR Expenses > Employee Recognition & Gifts',
    'Uniforms & Workwear': 'Employee & HR Expenses > Uniforms & Workwear',
    'Clothing & Accessories': 'Employee & HR Expenses > Uniforms & Workwear',
    'Safety Equipment': 'Employee & HR Expenses > Uniforms & Workwear',
    'Personal Care': 'Employee & HR Expenses > Employee Wellness',
    'Beauty & Health': 'Employee & HR Expenses > Employee Wellness',
    'Health & Fitness Services': 'Employee & HR Expenses > Employee Wellness',
    'Wellness Programs': 'Employee & HR Expenses > Employee Wellness',
    'Baby Products': 'Employee & HR Expenses > Employee Wellness',
    'Sports & Outdoors': 'Employee & HR Expenses > Employee Wellness',

    // Travel & Transportation
    'Travel & Transportation': 'Travel & Transportation > Transportation',
    'Airfare': 'Travel & Transportation > Transportation',
    'Car': 'Travel & Transportation > Transportation',
    'Vehicle Expenses': 'Travel & Transportation > Transportation',
    'Fuel & Gas': 'Travel & Transportation > Transportation',
    'Car Rentals': 'Travel & Transportation > Transportation',
    'Public Transportation': 'Travel & Transportation > Transportation',
    'Taxi & Ride Sharing': 'Travel & Transportation > Transportation',
    'Parking & Tolls': 'Travel & Transportation > Transportation',
    'Accommodations': 'Travel & Transportation > Accommodations',
    'Hotels & Lodging': 'Travel & Transportation > Accommodations',

    // Meals & Entertainment
    'Food': 'Meals & Entertainment > Business Meals',
    'Beverages': 'Meals & Entertainment > Business Meals',
    'Client Meals': 'Meals & Entertainment > Business Meals',
    'Team Meals': 'Meals & Entertainment > Business Meals',
    'Restaurant Expenses': 'Meals & Entertainment > Business Meals',
    'Catering': 'Meals & Entertainment > Business Meals',
    'Entertainment & Media': 'Meals & Entertainment > Client Entertainment',
    'Client Entertainment': 'Meals & Entertainment > Client Entertainment',
    'Corporate Events': 'Meals & Entertainment > Client Entertainment',

    // Marketing & Sales
    'Marketing & Advertising': 'Marketing & Sales > Marketing & Advertising',
    'Digital Marketing': 'Marketing & Sales > Marketing & Advertising',
    'Print Advertising': 'Marketing & Sales > Marketing & Advertising',
    'Trade Shows & Events': 'Marketing & Sales > Trade Shows & Events',
    'Promotional Materials': 'Marketing & Sales > Trade Shows & Events',
    'Sales Materials': 'Marketing & Sales > Sales Tools & Materials',
    'Customer Acquisition': 'Marketing & Sales > Sales Tools & Materials',

    // Professional Services
    'Services': 'Professional Services > Consulting & Advisory',
    'Professional Services': 'Professional Services > Consulting & Advisory',
    'Consulting & Advisory': 'Professional Services > Consulting & Advisory',
    'Legal Services': 'Professional Services > Legal Services',
    'Accounting & Tax': 'Professional Services > Accounting & Tax Services',
    'Financial Services': 'Professional Services > Accounting & Tax Services',
    'Insurance & Financial Services': 'Professional Services > Insurance & Risk Management',
    'Insurance & Risk Management': 'Professional Services > Insurance & Risk Management',

    // Operations & Maintenance
    'Equipment Maintenance': 'Operations & Maintenance > Equipment Maintenance & Repairs',
    'Repairs & Maintenance': 'Operations & Maintenance > Equipment Maintenance & Repairs',
    'Cleaning & Janitorial': 'Operations & Maintenance > Cleaning & Janitorial Services',
    'Security Services': 'Operations & Maintenance > Security & Safety',
    'Waste Management': 'Operations & Maintenance > Waste Management & Recycling',

    // Financial & Banking
    'Financial & Banking': 'Financial & Banking > Banking & Transaction Fees',
    'Banking Fees': 'Financial & Banking > Banking & Transaction Fees',
    'Loan Payments': 'Financial & Banking > Loan Payments & Interest',
    'Interest Expenses': 'Financial & Banking > Loan Payments & Interest',
    'Investment Management': 'Financial & Banking > Investment & Treasury',

    // Compliance & Regulatory
    'Licenses & Permits': 'Compliance & Regulatory > Licenses & Permits',
    'Regulatory Compliance': 'Compliance & Regulatory > Regulatory Fees & Compliance',
    'Tax Payments': 'Compliance & Regulatory > Tax Payments (excluding Income Tax)',
    'Audit & Compliance': 'Compliance & Regulatory > Audit & Professional Compliance',

    // Research & Development
    'R&D Equipment': 'Research & Development > R&D Equipment & Materials',
    'Research Materials': 'Research & Development > R&D Equipment & Materials',
    'Innovation Projects': 'Research & Development > Innovation & Patent Costs',
    'Patents & IP': 'Research & Development > Innovation & Patent Costs',
    'Product Development': 'Research & Development > Product Development Costs',

    // Quality & Testing
    'Quality Control': 'Quality & Testing > Quality Control & Assurance',
    'Testing & Certification': 'Quality & Testing > Testing & Certification',
    'Laboratory Services': 'Quality & Testing > Laboratory & Analysis Services',

    // Inventory & Supply Chain
    'Raw Materials': 'Inventory & Supply Chain > Raw Materials & Components',
    'Inventory': 'Inventory & Supply Chain > Inventory & Stock Management',
    'Shipping & Logistics': 'Inventory & Supply Chain > Shipping & Logistics',
    'Warehouse Costs': 'Inventory & Supply Chain > Warehouse & Storage',

    // Customer Support
    'Customer Support': 'Customer Support & Relations > Customer Support Services',
    'CRM Systems': 'Customer Support & Relations > CRM & Customer Management',
    'Customer Communications': 'Customer Support & Relations > Customer Communications',

    // Environmental & Sustainability
    'Environmental Compliance': 'Environmental & Sustainability > Environmental Compliance',
    'Sustainability Initiatives': 'Environmental & Sustainability > Sustainability Programs',
    'Green Technology': 'Environmental & Sustainability > Green Technology & Equipment',

    // Miscellaneous
    'Pet Supplies': 'Miscellaneous > Miscellaneous Business Expenses',
    'Other': 'Miscellaneous > Miscellaneous Business Expenses',
    'Charitable Donations': 'Miscellaneous > Charitable Contributions & Sponsorships',
    'Community Relations': 'Miscellaneous > Charitable Contributions & Sponsorships'
  };

  // Category breakdown with enterprise mapping
  const categoryBreakdown = data.reduce((acc, receipt) => {
    receipt.items?.forEach(item => {
      const originalCategory = item.category || 'Other';
      const enterpriseCategory = categoryMapping[originalCategory] || 'Miscellaneous';
      acc[enterpriseCategory] = (acc[enterpriseCategory] || 0) + item.total_price_with_discount;
    });
    return acc;
  }, {} as Record<string, number>);

  // Vendor analysis
  const vendorBreakdown = data.reduce((acc, receipt) => {
    const vendor = receipt.store_name;
    acc[vendor] = (acc[vendor] || 0) + receipt.total_price;
    return acc;
  }, {} as Record<string, number>);

  // Payment method analysis
  const paymentMethods = data.reduce((acc, receipt) => {
    const method = receipt.payment_method || 'unknown';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Date range analysis
  const dates = data.map(r => new Date(r.datetime.replace(/\./g, '-'))).sort((a, b) => a.getTime() - b.getTime());
  const dateRange = dates.length > 0 ? {
    earliest: dates[0].toLocaleDateString(),
    latest: dates[dates.length - 1].toLocaleDateString(),
    span: Math.ceil((dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24))
  } : null;

  // Single receipt view
  if (data.length === 1) {
    return (
      <div className="p-6">
        <ReceiptCard receipt={data[0]} index={0} />
      </div>
    );
  }

  // Multiple receipts view with tabs and summary
  return (
    <div className="p-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
          <button
            onClick={() => setShowSummary(true)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              showSummary
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            📊 Summary
          </button>
          {data.map((receipt, index) => (
            <button
              key={index}
              onClick={() => {
                setShowSummary(false);
                setActiveTab(index);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                !showSummary && safeActiveTab === index
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              🧾 {receipt.store_name.substring(0, 15)}
              {receipt.store_name.length > 15 ? '...' : ''}
            </button>
          ))}
        </div>

        <div className="text-sm text-slate-500 dark:text-slate-400">
          {data.length} receipts processed
        </div>
      </div>

      {/* Duplicate Detection Warning */}
      {duplicates.length > 0 && showDuplicates && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border-l-4 border-amber-500">
          <div className="flex items-start justify-between">
            <div className="flex">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">
                  ⚠️ Potential Duplicate Receipts Detected
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
                  Found {duplicates.length} possible duplicate{duplicates.length !== 1 ? 's' : ''}. Review these carefully to avoid double-counting expenses.
                </p>

                {/* Duplicate Details */}
                <div className="space-y-3">
                  {duplicates.map((duplicate, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium mr-3 ${
                            duplicate.confidence === 'high'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : duplicate.confidence === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {duplicate.confidence.toUpperCase()} CONFIDENCE
                          </span>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {duplicate.reason}
                          </span>
                        </div>
                      </div>

                      {/* Side-by-side comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {duplicate.receipts.map((receipt, receiptIndex) => (
                          <div key={receiptIndex} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                            <div className="text-sm">
                              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                                Receipt #{duplicate.indices[receiptIndex] + 1}: {receipt.store_name}
                              </div>
                              <div className="space-y-1 text-slate-600 dark:text-slate-400">
                                <div>Amount: <span className="font-medium">{receipt.currency} {receipt.total_price}</span></div>
                                <div>Date: <span className="font-medium">{receipt.datetime}</span></div>
                                <div>Items: <span className="font-medium">{receipt.items?.length || 0}</span></div>
                                {receipt.address && (
                                  <div>Location: <span className="font-medium text-xs">{receipt.address}</span></div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-xs text-amber-700 dark:text-amber-400">
                  💡 <strong>Tip:</strong> Check receipt details carefully. Same store visits on the same day might be legitimate separate purchases.
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDuplicates(false)}
              className="ml-4 p-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
              title="Dismiss warning"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Summary View */}
      {showSummary && (
        <div className="space-y-6">
          {/* Overall Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold">
                    {currencies.length === 1 ? currencies[0] : 'Mixed'} {totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Receipts</p>
                  <p className="text-2xl font-bold">{data.length}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Tax</p>
                  <p className="text-2xl font-bold">{totalTax.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Avg Receipt</p>
                  <p className="text-2xl font-bold">{averageReceiptAmount.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">Total Discounts</p>
                  <p className="text-2xl font-bold">{totalDiscounts.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>

            {dateRange && (
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm">Date Range</p>
                    <p className="text-lg font-bold">{dateRange.span} days</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Expense Categories</h3>
              </div>

              {/* Donut Chart */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    {Object.entries(categoryBreakdown)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 6)
                      .reduce((acc: { elements: React.ReactElement[], offset: number }, [category, amount], index) => {
                        const percentage = (amount / totalAmount) * 100;
                        const strokeDasharray = `${percentage * 2.51} ${251.2 - percentage * 2.51}`;
                        const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

                        acc.elements.push(
                          <circle
                            key={category}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={colors[index]}
                            strokeWidth="8"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={-acc.offset * 2.51}
                            className="transition-all duration-300 hover:stroke-width-10"
                          />
                        );

                        acc.offset += percentage;
                        return acc;
                      }, { elements: [] as React.ReactElement[], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{Object.keys(categoryBreakdown).length}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Categories</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2">
                {Object.entries(categoryBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([category, amount]) => {
                    const percentage = ((amount / totalAmount) * 100);
                    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: colors[0] }}
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-32">{category}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{amount.toFixed(2)}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Top Vendors Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Top Vendors</h3>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="space-y-4">
                {Object.entries(vendorBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 8)
                  .map(([vendor, amount], index) => {
                    const percentage = (amount / totalAmount) * 100;
                    const maxAmount = Math.max(...Object.values(vendorBreakdown));
                    const barWidth = (amount / maxAmount) * 100;
                    const receiptCount = data.filter(r => r.store_name === vendor).length;

                    return (
                      <div key={vendor} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-32">{vendor}</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{amount.toFixed(2)}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">({receiptCount}x)</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{percentage.toFixed(1)}% of total spend</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Quick Stats & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Payment Methods Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Payment Methods</h3>
              </div>

              {/* Mini Pie Chart */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    {Object.entries(paymentMethods)
                      .reduce((acc: { elements: React.ReactElement[], offset: number }, [method, count], index) => {
                        const percentage = (count / data.length) * 100;
                        const strokeDasharray = `${percentage * 2.51} ${251.2 - percentage * 2.51}`;
                        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

                        acc.elements.push(
                          <circle
                            key={method}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={colors[index]}
                            strokeWidth="12"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={-acc.offset * 2.51}
                            className="transition-all duration-300"
                          />
                        );

                        acc.offset += percentage;
                        return acc;
                      }, { elements: [] as React.ReactElement[], offset: 0 }).elements}
                  </svg>
                </div>
              </div>

              {/* Payment Methods Legend */}
              <div className="space-y-3">
                {Object.entries(paymentMethods).map(([method, count], index) => {
                  const percentage = (count / data.length) * 100;
                  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
                  return (
                    <div key={method} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: colors[index] }}
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{method}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{count}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tax & Financial Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Tax & Financial Summary</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">Total Tax Collected</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{totalTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-green-600 dark:text-green-400">Effective Tax Rate</span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">{totalAmount > 0 ? ((totalTax / totalAmount) * 100).toFixed(1) : '0.0'}%</span>
                  </div>
                </div>

                {totalTips > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Tips & Gratuity</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalTips.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {totalDiscounts > 0 && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-rose-800 dark:text-rose-300">Total Savings</span>
                      <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{totalDiscounts.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {dateRange && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Reporting Period</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{dateRange.earliest}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">to</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{dateRange.latest}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">({dateRange.span} days)</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Export Data</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Export receipt data for HR systems and accounting</p>
                </div>
              </div>

              {/* Export Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => exportToCSV(data)}
                  className="flex flex-col items-center p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm">Receipt Summary</span>
                  <span className="text-xs opacity-75">({data.length} rows)</span>
                </button>

                <button
                  onClick={() => exportDetailedCSV(data)}
                  className="flex flex-col items-center p-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="text-sm">Item Details</span>
                  <span className="text-xs opacity-75">({data.reduce((sum, r) => sum + (r.items?.length || 0), 0)} rows)</span>
                </button>

                <button
                  onClick={() => exportToPDF(data)}
                  className="flex flex-col items-center p-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm">Full Report</span>
                  <span className="text-xs opacity-75">Text Format</span>
                </button>

                <button
                  onClick={() => exportToJSON(data)}
                  className="flex flex-col items-center p-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span className="text-sm">JSON Data</span>
                  <span className="text-xs opacity-75">API Format</span>
                </button>
              </div>
            </div>
          </div>

          {/* Receipt Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.map((receipt, index) => {
              // Check if this receipt is flagged as duplicate
              const isDuplicate = duplicates.some(dup => dup.indices.includes(index));

              return (
                <div key={index} className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border hover:shadow-lg transition-shadow ${
                  isDuplicate
                    ? 'border-amber-300 dark:border-amber-600 bg-amber-50/30 dark:bg-amber-900/10'
                    : 'border-slate-200 dark:border-slate-700'
                }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 truncate">
                      {receipt.store_name}
                    </h3>
                    {isDuplicate && (
                      <div className="ml-2 flex items-center">
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-medium rounded-full">
                          ⚠️ DUPLICATE?
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {receipt.currency} {receipt.total_price}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Country:</span>
                    <span className="text-slate-700 dark:text-slate-300">{receipt.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Items:</span>
                    <span className="text-slate-700 dark:text-slate-300">{receipt.items?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date:</span>
                    <span className="text-slate-700 dark:text-slate-300">{receipt.datetime}</span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Individual Receipt View */}
      {!showSummary && (
        <div>
          <ReceiptCard receipt={data[safeActiveTab]} index={safeActiveTab} />
        </div>
      )}
    </div>
  );
}

// Separate component for individual receipt card
function ReceiptCard({ receipt, index }: { receipt: ReceiptData; index: number }) {
  return (
    <div className="bg-gradient-to-r from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900/50 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">{receipt.store_name || 'Unknown Store'}</h3>
                {receipt.address && (
                  <p className="text-blue-100 mb-1 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {receipt.address}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-blue-100">
                  {receipt.country && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {receipt.country}
                    </span>
                  )}
                  {receipt.receipt_type && (
                    <span className="bg-blue-600/30 px-3 py-1 rounded-full text-sm">
                      {receipt.receipt_type}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {receipt.datetime && (
                  <p className="text-blue-100 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {receipt.datetime}
                  </p>
                )}
                <div className="text-3xl font-bold">
                  {receipt.currency} {receipt.total_price}
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Content Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Financial Summary */}
              <div className="space-y-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Financial Summary</h4>
                  </div>
                  <div className="space-y-3">
                    {receipt.currency && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Currency</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{receipt.currency}</span>
                      </div>
                    )}
                    {receipt.sub_total_amount !== 'unknown' && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{receipt.sub_total_amount}</span>
                      </div>
                    )}
                    {receipt.total_discount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Discount</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">-{receipt.total_discount}</span>
                      </div>
                    )}
                    {receipt.tax > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Tax</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{receipt.tax}</span>
                      </div>
                    )}
                    {receipt.tips > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Tips</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{receipt.tips}</span>
                      </div>
                    )}
                    <div className="border-t border-emerald-200 dark:border-emerald-800 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-200">Total</span>
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{receipt.total_price}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment & Tax Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Payment & Tax Info</h4>
                  </div>
                  <div className="space-y-3">
                    {receipt.payment_method && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Payment Method</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{receipt.payment_method}</span>
                      </div>
                    )}
                    {receipt.all_items_price_with_tax !== 'unknown' && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Prices Include Tax</span>
                        <span className={`font-semibold ${receipt.all_items_price_with_tax ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {receipt.all_items_price_with_tax ? 'Yes' : 'No'}
                        </span>
                      </div>
                    )}
                    {receipt.taxes_not_included_sum > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Taxes Not Included</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{receipt.taxes_not_included_sum}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Items ({receipt.items?.length || 0})</h4>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3">
                  {receipt.items && receipt.items.length > 0 ? (
                    receipt.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-semibold text-slate-800 dark:text-slate-200 flex-1 pr-4">{item.name}</h5>
                          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {item.total_price_with_discount}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Quantity</span>
                              <span className="text-slate-700 dark:text-slate-300">{item.quantity} {item.measurement_unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Unit Price</span>
                              <span className="text-slate-700 dark:text-slate-300">{item.unit_price}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Category</span>
                              <span className="text-slate-700 dark:text-slate-300">{item.category}</span>
                            </div>
                            {item.discount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Discount</span>
                                <span className="text-red-600 dark:text-red-400">-{item.discount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                        </svg>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">No items found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tax Details */}
            {receipt.taxs_items && receipt.taxs_items.length > 0 && (
              <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Tax Breakdown</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receipt.taxs_items.map((taxItem, taxItemIndex) => (
                    <div key={taxItemIndex} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">{taxItem.tax_name}</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Rate</span>
                          <span className="text-slate-700 dark:text-slate-300">{taxItem.percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Base Amount</span>
                          <span className="text-slate-700 dark:text-slate-300">{taxItem.tax_from_amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Tax Amount</span>
                          <span className="text-slate-700 dark:text-slate-300">{taxItem.tax}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                          <span className="font-medium text-slate-700 dark:text-slate-300">Total</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">{taxItem.total}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
  );
}