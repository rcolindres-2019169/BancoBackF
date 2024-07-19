import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import Transfer from '../transfer/transfer.model.js';
import Account from '../account/account.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createTransferReceipt = async (transfer) => {
    const newTransfer = new Transfer(transfer);
    await newTransfer.save();

    const receiptsDir = path.join(__dirname, '..', 'receiptsTransfer');

    if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir);
    }

    const filePath = path.join(receiptsDir, `transfer_receipt_${newTransfer._id}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Colores y fuentes
    const primaryColor = '#004080';
    const secondaryColor = '#FFFFFF';
    const textColor = '#333333';

    doc.font('Helvetica');

    // Encabezado
    doc.rect(0, 0, doc.page.width, 130)
        .fill(primaryColor)
        .fillColor(secondaryColor)
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('Banco Inter', { align: 'center', valign: 'center' })
        .fontSize(20)
        .text('Recibo de Transferencia', { align: 'center', valign: 'center' });

    // Obtener la información de la cuenta de origen y destino
    const fromAccountInfo = await Account.findOne({ accountNumber: transfer.fromAccount }).populate('user');
    const toAccountInfo = await Account.findOne({ accountNumber: transfer.toAccount }).populate('user');

    // Espacio después del encabezado
    doc.moveDown(2);


    doc.fillColor(textColor)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Detalles de la Transferencia', { align: 'left' });
    doc.moveDown(0.5);

    // Datos de la transferencia
    const tableData = [
        { label: 'Cuenta de origen:', value: `${fromAccountInfo.accountNumber} - ${fromAccountInfo.user.name} (${fromAccountInfo.type})` },
        { label: 'Cuenta de destino:', value: `${toAccountInfo.accountNumber} - ${toAccountInfo.user.name} (${toAccountInfo.type})` },
        { label: 'Fecha y Hora:', value: `${transfer.date.toLocaleDateString()} - ${transfer.date.toLocaleTimeString()}` },
        { label: 'Número de transacción:', value: `${newTransfer._id}` },
        { label: 'Monto transferido:', value: `Q.${transfer.amount.toFixed(2)}` },
        { label: 'Comentario:', value: `${transfer.comment || 'Sin comentario'}` }
    ];

    const tableTop = doc.y + 10;
    const itemMargin = 25;

  
    // Agregar datos a la tabla
    tableData.forEach((item, index) => {
        const y = tableTop + index * itemMargin + 10;
        doc.fillColor(primaryColor)
            .font('Helvetica-Bold')
            .text(item.label, 55, y);
        doc.fillColor(textColor)
            .font('Helvetica')
            .text(item.value, 200, y);
    });

    // Pie de página
    doc.fillColor(primaryColor)
        .rect(0, doc.page.height - 100, doc.page.width, 50)
        .fill()
        .fillColor(secondaryColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('¡Gracias por confiar en Banco Inter!', doc.page.width / 2, doc.page.height - 75, { align: 'center', valign: 'center', baseline: 'middle' });

    doc.end();

    return filePath;
};