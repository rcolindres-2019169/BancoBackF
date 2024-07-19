import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url'; // Importar las funciones necesarias para trabajar con URLs
import Deposit from '../deposit/deposit.model.js';

// Obtener el directorio actual del módulo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createDepositReceipt = async (account, depositAmount) => {
    const newDeposit = new Deposit({
        accountNumber: account.accountNumber,
        amount: depositAmount,
        date: new Date()
    });
    await newDeposit.save();

    const receiptsDir = path.join(__dirname, '..', 'receipts'); // Carpeta específica para guardar las facturas

    // Crear la carpeta 'receipts' si no existe
    if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir);
    }

    const filePath = path.join(receiptsDir, `deposit_receipt_${account.accountNumber}_${newDeposit._id}.pdf`); // Ruta completa del archivo
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Colores
    const primaryColor = '#00529B';
    const secondaryColor = '#FFFFFF';
    const textColor = '#000000';

    // Encabezado con color de fondo
    doc.rect(0, 0, doc.page.width, 150)
        .fill(primaryColor)
        .fillColor(secondaryColor)
        .fontSize(24)
        .text('Banco Inter', { align: 'center', valign: 'center' })
        .fontSize(18)
        .text('Recibo de Depósito', { align: 'center' });

    doc.moveDown();
    doc.fillColor(textColor)
        .fontSize(14)
        .text('--------------------------------------------', { align: 'center' });

    // Información en tabla
    const tableData = [
        ['Número de cuenta:', account.accountNumber],
        ['Nombre del cliente:', account.user.name],
        ['Fecha:', newDeposit.date.toLocaleDateString()],
        ['Hora:', newDeposit.date.toLocaleTimeString()],
        ['Número de transacción:', newDeposit._id],
        ['Cantidad depositada:', `Q.${depositAmount.toFixed(2)}`],
        ['Concepto:', 'Depósito en efectivo']
    ];

    const tableTop = 200; // Posición superior de la tabla
    const itemHeight = 30; // Altura de cada elemento

    // Dibujar tabla
    tableData.forEach((item, index) => {
        const y = tableTop + index * itemHeight;
        doc.fillColor(primaryColor)
            .fontSize(16)
            .text(item[0], 50, y)
            .fillColor(textColor)
            .text(item[1], 300, y);
    });

    // Firma del cajero
    const signatureTop = 500;
    const textWidth = doc.widthOfString('Firma del Cajero:'); // Calcular la longitud del texto

    doc.fillColor(primaryColor)
        .fontSize(16)
        .text('Firma del Cajero:', 50, signatureTop)
        .moveTo(50 + textWidth + 10, signatureTop + 20) // Agregar un espacio de 10 puntos entre el texto y la línea
        .lineTo(200 + textWidth + 10, signatureTop + 20)
        .stroke();

    // Pie de página con color de fondo
    doc.fillColor(primaryColor)
        .rect(0, doc.page.height - 100, doc.page.width, 100)
        .fill()
        .fillColor(secondaryColor)
        .fontSize(14)
        .text('¡Gracias por confiar en Banco Inter!', { align: 'center', valign: 'center' });

    doc.end();

    return filePath;
};