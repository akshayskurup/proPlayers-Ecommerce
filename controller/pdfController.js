const pdfController = {}
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path')
let orders = require('../model/orderSchema')




const generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const invoiceData = await orders.findById(orderId).populate('customer').populate("items.product");

    const doc = new PDFDocument();

    // Set font styles
    doc.font('Helvetica-Bold');
    doc.fontSize(18);

    const fileName = `invoice_${orderId}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);

    // Title
    doc.text('Invoice', { align: 'center' });

    // Customer Information
    doc.fontSize(12).font('Helvetica');
    doc.moveDown().text('Bill To:');
    doc.text(`${invoiceData.customer.name}`);
    doc.text(`Address: ${invoiceData.address.houseName}`);
    doc.text(`${invoiceData.address.street},${invoiceData.address.city},${invoiceData.address.pincode},${invoiceData.address.state}`);
    doc.text(`Email: ${invoiceData.customer.email}`);
    doc.text(`Phone: ${invoiceData.customer.phone}`);
    doc.moveDown();
    doc.moveDown()

    // Products Table Header
    doc.fontSize(14).font('Helvetica-Bold');
    doc.moveDown();
    doc.text('Product', { align: 'left' });
    doc.moveUp();
    doc.text('Quantity', { align: 'center' });
    doc.moveUp();
    doc.text('Price', { align: 'right' });
    doc.moveUp();

    // Products Table Body
    doc.fontSize(12).font('Helvetica');
    invoiceData.items.forEach(item => {
      doc.moveDown();
      doc.moveDown();
      doc.moveDown();
      doc.moveDown();
      doc.text(item.product.productName, { align: 'left' });
      doc.moveUp();
      doc.text(item.quantity, { align: 'center' });
      doc.moveUp();
      doc.text(item.product.price, { align: 'right' });
      doc.moveUp();
    });

    // Invoice Total
    doc.fontSize(14).font('Helvetica-Bold');
    doc.moveDown()
    doc.moveDown()
    doc.moveDown()
    doc.moveDown().text(`Subtotal: $${invoiceData.totalAmount.toFixed(2)}`);
    doc.text(`Tax (${(invoiceData.taxRate * 100).toFixed(2)}%): $${invoiceData.totalAmount.toFixed(2)}`);
    doc.text(`Total: $${invoiceData.totalAmount.toFixed(2)}`);

    // Invoice Footer
    doc.moveDown().text('Thank you for your purchase!. Team ProPlayers', { align: 'center' });
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating the invoice');
  }
};
//module exports 
module.exports = {
  generateInvoice
}

