const cds = require('@sap/cds');

module.exports = class QuotationService extends cds.ApplicationService {
  init() {
    const { Quotations } = cds.entities('demo');

    this.on('approveQuotation', async (req) => {
      const { quotationNo } = req.data;

      const q = await SELECT.one.from(Quotations).where({ quotationNo });
      if (!q) return req.error(404, `Quotation ${quotationNo} not found`);
      if (q.status === 'APPROVED') return req.error(409, `Quotation ${quotationNo} is already approved `);

      await UPDATE(Quotations).set({ status: 'APPROVED' }).where({ quotationNo });
      return `Quotation ${quotationNo} approved`;
    });

    return super.init();
  }
};