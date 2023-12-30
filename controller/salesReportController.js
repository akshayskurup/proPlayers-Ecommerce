let salesReportController = {};
let Order = require('../model/orderSchema');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx'); // Import the xlsx library

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

salesReportController.generateExcelReport = async (req, res) => {
//     try {
//         const { filter, selectedValue } = req.params;
//         const salesData = await fetchSalesData(filter, selectedValue);

//         if (!salesData || salesData.length === 0) {
//             return res.status(404).json({ error: "No data found for the selected filter and value" });
//         }
//         console.log("Sales data: ",salesData);

//         // Convert the data to an array of arrays
//         // const dataForExcel = salesData.map(entry => [
//         //     entry.orderId,
//         //     entry.customer.name,
//         //     entry.totalAmount,
//         //     entry.orderDate.toLocaleDateString()
//         // ]);
//         // console.log("Data for Excel: ", dataForExcel);


//         // // Create a workbook
//         // const workbook = XLSX.utils.book_new();
//         // // const worksheet = XLSX.utils.aoa_to_sheet([
//         // //     ['Order ID', 'Customer', 'Total Amount', 'Order Date'], // Header row
//         // //     ...dataForExcel // Data rows
//         // // ]);
//         // const worksheet = XLSX.utils.json_to_sheet(dataForExcel, {
//         //     header: ['Order ID', 'Customer', 'Total Amount', 'Order Date'],
//         //     ...dataForExcel
//         //   });
//         // console.log("Worksheet: ", worksheet);

//         const worksheet = XLSX.utils.json_to_sheet(dataForExcel, {
//             header: ['Order ID', 'Customer', 'Total Amount', 'Order Date'],
//         });
        
//         // Modify dataForExcel to be an array of objects
//         const dataForExcel = salesData.map(entry => ({
//             'Order ID': entry.orderId,
//             'Customer': entry.customer.name,
//             'Total Amount': entry.totalAmount,
//             'Order Date': entry.orderDate.toLocaleDateString()
//         }));
        
//         // Enable Shared Strings Table for styling
//         XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');


       

//         const headerCellStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'FFFF00' } } };
// Object.keys(worksheet).forEach(key => {
//   if (key.startsWith('A1')) {
//     worksheet[key].s = headerCellStyle;
//   }
// });
//         // Enable Shared Strings Table for styling
//         XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

//         // Enable Shared Strings Table for styling
//         const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer', bookSST: true });
        
//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', `attachment; filename=sales-report-${filter}-${selectedValue}.xlsx`);

//         // Send the buffer as the response
//         res.end(excelBuffer);
//     } catch (error) {
//         console.error("Error generating Excel report:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }

const { filter, selectedValue } = req.params;
try {
    const salesData = await fetchSalesData(filter, selectedValue);

    if (!salesData || salesData.length === 0) {
        return res.status(404).json({ error: "No data found for the selected filter and value" });
    }
    console.log("Sales data: ", salesData);

    // Convert the data to an array of objects
    const dataForExcel = salesData.map(entry => ({
        'Order ID': entry.orderId,
        'Customer': entry.customer.name,
        'Total Amount': entry.totalAmount,
        'Order Date': entry.orderDate.toLocaleDateString()
    }));
    console.log("Data for Excel: ", dataForExcel);

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel, {
        header: ['Order ID', 'Customer', 'Total Amount', 'Order Date'],
    });
    console.log("Worksheet: ", worksheet);

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