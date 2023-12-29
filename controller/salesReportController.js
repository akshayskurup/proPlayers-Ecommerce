let salesReportController = {}
let Order = require('../model/orderSchema')
const PDFDocument = require('pdfkit');

salesReportController.generatePdfReport = async (req, res) => {
    try {
        const filter = req.params.filter; 
        const selectedValue = req.params.selectedValue; 
        const [year,month] = selectedValue.split('-');
        const salesData = await fetchSalesData(filter, selectedValue);

        console.log('Fetched Sales Data:', salesData);

        if (!salesData || salesData.length === 0) {
            // If no data is fetched, send an appropriate response
            return res.status(404).json({ error: "No data found for the selected filter and value" });
        }

        // Create a PDF document
        const pdfDoc = new PDFDocument();
       

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=sales-report-${filter}-${selectedValue}.pdf`);

        pdfDoc.pipe(res);
        pdfDoc.fontSize(12);
        let title = `Sales Report - ${filter}`;

        if (filter === 'daily') {
            title += ` (${selectedValue})`;
        } else if (filter === 'monthly') {
            title += ` (${year}-${month})`;
        } else if (filter === 'yearly') {
            title += ` (${year})`;
        }
        
        pdfDoc.text(title, { align: 'center', underline: true });
        pdfDoc.moveDown();
        salesData.forEach(entry => {
            pdfDoc.moveDown();
            
            pdfDoc.text(`Order ID: ${entry.orderId}`);
            pdfDoc.text(`Customer: ${entry.customer.name}`);
            entry.items.forEach((item, itemIndex) => {
                pdfDoc.text(`Product${itemIndex + 1}: ${item.product.productName}`);
            });
            pdfDoc.text(`Total Amount: ${entry.totalAmount}`);
            pdfDoc.text(`Order Date: ${entry.orderDate.toLocaleDateString()}`);


        });
        pdfDoc.end();
    } catch (error) {
        console.error("Error generating PDF report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


async function fetchSalesData(filter, selectedValue) {
    try {
        let orders;

        if (filter === 'daily') {
            const startDate = new Date(selectedValue);
            const endDate = new Date(selectedValue);
            endDate.setDate(endDate.getDate() + 1); // Increment the date by 1 to get the end of the day
        
            orders = await Order.find({
                orderDate: { $gte: startDate, $lt: endDate },
            }).populate('customer').populate('items.product');
        } else if (filter === 'monthly') {
            const [year, month] = selectedValue.split('-');
            orders = await Order.find({
                orderDate: {
                    $gte: new Date(year, month - 1, 1),
                    $lt: new Date(year, month, 1)
                }
            }).populate('customer').populate('items.product');
        } else if (filter === 'yearly') {
            // Fetch orders for the selected year
            orders = await Order.find({
                orderDate: {
                    $gte: new Date(selectedValue, 0, 1),
                    $lt: new Date(Number(selectedValue) + 1, 0, 1)
                }
            }).populate('customer').populate('items.product');
        }


        return orders;
    } catch (error) {
        console.error("Error fetching sales data:", error);
        throw error;
    }
}


module.exports = salesReportController