export const extractDataPrompt: string = `
Extract and organize the content provided below into structured data in JSON format. 
Focus on identifying only the relevant details based on the following categories: 
1. Invoices Tab: Serial Number, Customer Name, Product Name, Quantity, Tax, Total Amount, Date. 
2. Products Tab: Name, Quantity, Unit Price, Tax, Price with Tax, Discount (if applicable). 
3. Customers Tab: Customer Name, Phone Number, Total Purchase Amount. 
If any field's data is not available in the context, leave it empty. 
Ensure the output is strictly in JSON format, without any extra explanations, redundant text, or letters. 
Only provide the structured JSON response.
`;