export const extractDataPrompt: string = `
Extract and organize the content provided below into structured data in JSON format. 
Focus on identifying only the relevant details based on the following categories: 
1. Invoices Tab: serialNumber, customerName, productName, quantity, tax, totalAmount, date. 
2. Products Tab: name, quantity, unitPrice, tax, priceWithTax, discount (if applicable). 
3. Customers Tab: customerName, phoneNumber, totalPurchaseAmount. 
If any field's data is not available in the context, leave it empty. 
Ensure the output is strictly in JSON format, without any extra explanations, redundant text, or letters. 
Only provide the structured JSON response and also make sure the keys does not have white spaces.
`;