let salesReportController = {};
let Order = require('../model/orderSchema');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx'); 

salesReportController.generatePdfReport = async (req, res) => {
    try {
        const { filter, selectedValue } = req.params;
        const [year, month] = selectedValue.split('-');
        const salesData = await fetchSalesData(filter, selectedValue);

        if (!salesData || salesData.length === 0) {
            return res.status(404).json({ error: "No data found for the selected filter and value" });
        }

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
        let totalOrders = 0;
        let totalAmount = 0;
        salesData.forEach(entry => {
            pdfDoc.moveDown();
            pdfDoc.text(`Order ID: ${entry.orderId}`);
            pdfDoc.text(`Customer: ${entry.customer.name}`);
            entry.items.forEach((item, itemIndex) => {
                pdfDoc.text(`Product${itemIndex + 1}: ${item.product.productName}`);
            });
            pdfDoc.text(`Total Amount: Rs:${entry.totalAmount}`);
            pdfDoc.text(`Order Date: ${entry.orderDate.toLocaleDateString()}`);
            totalOrders += 1;
            totalAmount += entry.totalAmount;
        });
        pdfDoc.moveDown();
        pdfDoc.moveDown();
        pdfDoc.moveDown();
        pdfDoc.text(`Total Orders: ${totalOrders}`);
        pdfDoc.text(`Total Amount: Rs:${totalAmount}`);
        pdfDoc.end();
    } catch (error) {
        console.error("Error generating PDF report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// salesReportController.generateExcelReport = async (req, res) => {
// const { filter, selectedValue } = req.params;
// try {
//     const salesData = await fetchSalesData(filter, selectedValue);

//     if (!salesData || salesData.length === 0) {
//         return res.status(404).json({ error: "No data found for the selected filter and value" });
//     }
//     console.log("Sales data: ", salesData);

//     // Convert the data to an array of objects
//     const dataForExcel = salesData.map(entry => ({
//         'Order ID': entry.orderId,
//         'Customer': entry.customer.name,
//         'Total Amount': entry.totalAmount,
//         'Order Date': entry.orderDate.toLocaleDateString()
//     }));
//     console.log("Data for Excel: ", dataForExcel);

//     // Create a workbook
//     const workbook = XLSX.utils.book_new();
//     const worksheet = XLSX.utils.json_to_sheet(dataForExcel, {
//         header: ['Order ID', 'Customer', 'Total Amount', 'Order Date'],
//     });
//     console.log("Worksheet: ", worksheet);

//     const headerCellStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'FFFF00' } } };
//     Object.keys(worksheet).forEach(key => {
//         if (key.startsWith('A1')) {
//             worksheet[key].s = headerCellStyle;
//         }
//     });

//     // Enable Shared Strings Table for styling
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

//     // Enable Shared Strings Table for styling
//     const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer', bookSST: true });

//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename=sales-report-${filter}-${selectedValue}.xlsx`);

//     // Send the buffer as the response
//     res.end(excelBuffer);
// } catch (error) {
//     console.error("Error generating Excel report:", error);
//     res.status(500).json({ error: "Internal Server Error" });
// }
// };
salesReportController.generateExcelReport = async (req, res) => {
    const { filter, selectedValue } = req.params;
    try {
        const salesData = await fetchSalesData(filter, selectedValue);

        if (!salesData || salesData.length === 0) {
            return res.status(404).json({ error: "No data found for the selected filter and value" });
        }

        // Convert the data to an array of objects
        const dataForExcel = salesData.map(entry => ({
            'Order ID': entry.orderId,
            'Customer': entry.customer.name,
            'Total Amount': entry.totalAmount,
            'Order Date': entry.orderDate.toLocaleDateString()
        }));

        // Calculate total orders and total amount
        let totalOrders = 0;
        let totalAmount = 0;

        salesData.forEach(entry => {
            totalOrders += 1;
            totalAmount += entry.totalAmount;
        });

        // Append a row with totals to the data for Excel
        const totalsRow = {
            'Order ID': 'Total Orders:',
            'Customer': totalOrders,
            'Total Amount': totalAmount,
            'Order Date': '',
        };

        dataForExcel.push(totalsRow);

        // Create a workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(dataForExcel, {
            header: ['Order ID', 'Customer', 'Total Amount', 'Order Date'],
        });

        const headerCellStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'FFFF00' } } };
        Object.keys(worksheet).forEach(key => {
            if (key.startsWith('A1')) {
                worksheet[key].s = headerCellStyle;
            }
        });

        // Enable Shared Strings Table for styling
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

        // Enable Shared Strings Table for styling
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer', bookSST: true });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=sales-report-${filter}-${selectedValue}.xlsx`);

        // Send the buffer as the response
        res.end(excelBuffer);
    } catch (error) {
        console.error("Error generating Excel report:", error);
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