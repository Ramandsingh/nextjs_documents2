import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
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

export function ReceiptTable({ data }: ReceiptTableProps) {
  if (data.length === 0) {
    return <p className="p-4 text-center text-gray-500">No receipt data to display.</p>;
  }

  return (
    <div className="w-full overflow-auto border border-gray-300 rounded-lg"> {/* Added border and rounded-lg */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-800"> {/* Banding for header */}
            <TableHead className="border border-gray-200 dark:border-gray-700 p-2">Store Info</TableHead>
            <TableHead className="border border-gray-200 dark:border-gray-700 p-2">Financials</TableHead>
            <TableHead className="border border-gray-200 dark:border-gray-700 p-2">Payment & Tax Summary</TableHead>
            <TableHead className="border border-gray-200 dark:border-gray-700 p-2">Items</TableHead>
            <TableHead className="border border-gray-200 dark:border-gray-700 p-2">Tax Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((receipt, receiptIndex) => (
            <TableRow key={receiptIndex} className={receiptIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}> {/* Banding for rows */}
              {/* Store Info */}
              <TableCell className="border border-gray-200 dark:border-gray-700 p-2 align-top">
                <strong>{receipt.store_name || 'Unknown Store'}</strong><br/>
                {receipt.address && <><small>{receipt.address}</small><br/></>}
                {receipt.country && <><small>Country: {receipt.country}</small><br/></>}
                {receipt.receipt_type && <><small>Type: {receipt.receipt_type}</small><br/></>}
                {receipt.datetime && <><small>Date: {receipt.datetime}</small></>}
              </TableCell>

              {/* Financials */}
              <TableCell className="border border-gray-200 dark:border-gray-700 p-2 align-top">
                {receipt.currency && <>Currency: {receipt.currency}<br/></>}
                {receipt.sub_total_amount !== 'unknown' && <>Sub Total: {receipt.sub_total_amount}<br/></>}
                {receipt.total_price && <>Total: {receipt.total_price}<br/></>}
                {receipt.total_discount && <>Discount: {receipt.total_discount}<br/></>}
                {receipt.rounding && <>Rounding: {receipt.rounding}</>}
              </TableCell>

              {/* Payment & Tax Summary */}
              <TableCell className="border border-gray-200 dark:border-gray-700 p-2 align-top">
                {receipt.payment_method && <>Payment: {receipt.payment_method}<br/></>}
                {receipt.tax && <>Tax: {receipt.tax}<br/></>}
                {receipt.taxes_not_included_sum && <>Taxes Not Incl. Sum: {receipt.taxes_not_included_sum}<br/></>}
                {receipt.tips && <>Tips: {receipt.tips}<br/></>}
                {receipt.all_items_price_with_tax !== 'unknown' && <>Items Price Incl. Tax: {String(receipt.all_items_price_with_tax)}</>}
              </TableCell>

              {/* Items */}
              <TableCell className="border border-gray-200 dark:border-gray-700 p-2 align-top">
                {receipt.items && receipt.items.length > 0 ? (
                  receipt.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="mb-2 last:mb-0">
                      <strong>{item.name}</strong><br/>
                      <small>Qty: {item.quantity} {item.measurement_unit}</small><br/>
                      <small>Price (No Disc): {item.total_price_without_discount}</small><br/>
                      <small>Unit Price: {item.unit_price}</small><br/>
                      <small>Price (With Disc): {item.total_price_with_discount}</small><br/>
                      <small>Discount: {item.discount}</small><br/>
                      <small>Category: {item.category}</small><br/>
                      <small>Item Tax Incl: {String(item.item_price_with_tax)}</small>
                    </div>
                  ))
                ) : (
                  <small>No items found</small>
                )}
              </TableCell>

              {/* Tax Details */}
              <TableCell className="border border-gray-200 dark:border-gray-700 p-2 align-top">
                {receipt.taxs_items && receipt.taxs_items.length > 0 ? (
                  receipt.taxs_items.map((taxItem, taxItemIndex) => (
                    <div key={taxItemIndex} className="mb-2 last:mb-0">
                      <strong>{taxItem.tax_name}</strong><br/>
                      <small>Percentage: {taxItem.percentage}%</small><br/>
                      <small>From Amount: {taxItem.tax_from_amount}</small><br/>
                      <small>Tax: {taxItem.tax}</small><br/>
                      <small>Total: {taxItem.total}</small><br/>
                      <small>Tax Included: {String(taxItem.tax_included)}</small>
                    </div>
                  ))
                ) : (
                  <small>No tax details found</small>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}