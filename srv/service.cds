using demo from '../db/schema';

@mcp
@odata
service QuotationService {
    @readonly
    entity Quotations as projection on demo.Quotations;
    action approveQuotation(quotationNo: String @mandatory ) returns String;
}
annotate QuotationService with @mcp.instructions: 'Manage sales quotations. Status is either OPEN or APPROVED. Use approveQuotation to approve an OPEN quotation by its number, e.g. Q-1001.';
