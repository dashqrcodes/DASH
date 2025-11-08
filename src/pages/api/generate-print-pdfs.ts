import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import nodemailer from 'nodemailer';

const inchesToPoints = (inches: number) => inches * 72;

type MaybeBuffer = Uint8Array | Buffer;

const decodeBase64Image = (dataUri?: string): MaybeBuffer | null => {
    if (!dataUri) return null;
    const matches = dataUri.match(/^data:(.*?);base64,(.*)$/);
    if (matches && matches[2]) {
        return Buffer.from(matches[2], 'base64');
    }
    // Fallback assume raw base64 string
    try {
        return Buffer.from(dataUri, 'base64');
    } catch (error) {
        console.warn('Failed to decode base64 image', error);
        return null;
    }
};

const embedImage = async (pdfDoc: PDFDocument, data?: string | MaybeBuffer | null) => {
    if (!data) return null;
    try {
        if (data instanceof Uint8Array || data instanceof Buffer) {
            return pdfDoc.embedPng(data).catch(() => pdfDoc.embedJpg(data));
        }
        const buffer = decodeBase64Image(data);
        if (!buffer) return null;
        return pdfDoc.embedPng(buffer).catch(() => pdfDoc.embedJpg(buffer));
    } catch (error) {
        console.warn('Failed to embed image', error);
        return null;
    }
};

const fetchImageBuffer = async (url?: string): Promise<MaybeBuffer | null> => {
    if (!url) return null;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Unable to fetch image');
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.warn('Failed to fetch image', error);
        return null;
    }
};

const addCenteredText = (
    page: any,
    text: string,
    font: any,
    fontSize: number,
    y: number,
    color = rgb(1, 1, 1)
) => {
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const pageWidth = page.getWidth();
    const x = (pageWidth - textWidth) / 2;
    page.drawText(text, { x, y, size: fontSize, font, color });
};

const wrapText = (text: string, font: any, fontSize: number, maxWidth: number): string[] => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
};

const generateCardFrontPdf = async ({
    name,
    sunrise,
    sunset,
    photo
}: {
    name: string;
    sunrise: string;
    sunset: string;
    photo?: string | null;
}) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([inchesToPoints(4), inchesToPoints(6)]);
    const width = page.getWidth();
    const height = page.getHeight();

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Background
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0, 0, 0) });

    // Photo fill
    if (photo) {
        const image = await embedImage(pdfDoc, photo);
        if (image) {
            const imgWidth = image.width;
            const imgHeight = image.height;
            const backgroundRatio = imgWidth / imgHeight;
            const pageRatio = width / height;
            let drawWidth = width;
            let drawHeight = height;
            if (backgroundRatio > pageRatio) {
                drawHeight = height;
                drawWidth = height * backgroundRatio;
            } else {
                drawWidth = width;
                drawHeight = width / backgroundRatio;
            }
            page.drawImage(image, {
                x: (width - drawWidth) / 2,
                y: (height - drawHeight) / 2,
                width: drawWidth,
                height: drawHeight
            });
        }
    }

    // Gradient overlay bottom for readability
    page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height: height * 0.35,
        color: rgb(0, 0, 0),
        opacity: 0.55
    });

    addCenteredText(page, 'In Loving Memory', italicFont, 18, height * 0.30, rgb(1, 1, 1));
    addCenteredText(page, name, boldFont, 24, height * 0.22, rgb(1, 1, 1));
    addCenteredText(page, `${sunrise} – ${sunset}`, boldFont, 14, height * 0.16, rgb(1, 1, 1));

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};

const generateCardBackPdf = async ({
    sunrise,
    sunset,
    qrCodeUrl,
    psalmText,
    fdName,
    fdPhone
}: {
    sunrise: string;
    sunset: string;
    qrCodeUrl?: string | null;
    psalmText?: string;
    fdName?: string;
    fdPhone?: string;
}) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([inchesToPoints(4), inchesToPoints(6)]);
    const width = page.getWidth();
    const height = page.getHeight();

    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.11, 0.10, 0.29) });

    const contentMargin = 28;

    // Verse text box
    const text = psalmText || 'The LORD is my shepherd; I shall not want...';
    page.drawRectangle({
        x: contentMargin,
        y: height * 0.35,
        width: width - contentMargin * 2,
        height: height * 0.35,
        color: rgb(1, 1, 1),
        opacity: 0.08,
        borderWidth: 1,
        borderColor: rgb(1, 1, 1)
    });

    const textBoxWidth = width - contentMargin * 2 - 12;
    const textLines = wrapText(text, regularFont, 10, textBoxWidth);
    let currentY = height * 0.62;
    const lineHeight = 12;
    textLines.forEach((line: string) => {
        page.drawText(line, {
            x: contentMargin + 6,
            y: currentY,
            size: 10,
            font: regularFont,
            color: rgb(1, 1, 1)
        });
        currentY -= lineHeight;
    });

    // Dates + QR Row
    const rowY = height * 0.20;
    const leftX = contentMargin;
    const rightX = width - contentMargin - 70;

    page.drawText('Sunrise', {
        x: leftX,
        y: rowY + 36,
        size: 9,
        font: regularFont,
        color: rgb(0.83, 0.84, 0.95)
    });
    page.drawText(sunrise, {
        x: leftX,
        y: rowY + 20,
        size: 12,
        font: boldFont,
        color: rgb(1, 1, 1)
    });

    page.drawText('Sunset', {
        x: rightX,
        y: rowY + 36,
        size: 9,
        font: regularFont,
        color: rgb(0.83, 0.84, 0.95)
    });
    page.drawText(sunset, {
        x: rightX,
        y: rowY + 20,
        size: 12,
        font: boldFont,
        color: rgb(1, 1, 1)
    });

    const qrBuffer = await fetchImageBuffer(qrCodeUrl || undefined);
    if (qrBuffer) {
        const qrImage = await embedImage(pdfDoc, qrBuffer);
        if (qrImage) {
            const qrSize = 64;
            page.drawImage(qrImage, {
                x: width / 2 - qrSize / 2,
                y: rowY + 6,
                width: qrSize,
                height: qrSize
            });
        }
    }

    // Footer FD details
    if (fdName || fdPhone) {
        addCenteredText(page, 'Honoring your loved one with dignity and respect.', regularFont, 8, 30, rgb(0.83, 0.84, 0.95));
        if (fdName) addCenteredText(page, fdName, boldFont, 10, 18, rgb(1, 1, 1));
        if (fdPhone) addCenteredText(page, fdPhone, boldFont, 9, 8, rgb(1, 1, 1));
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};

const generatePosterPdf = async ({
    name,
    sunrise,
    sunset,
    photo,
    qrCodeUrl
}: {
    name: string;
    sunrise: string;
    sunset: string;
    photo?: string | null;
    qrCodeUrl?: string | null;
}) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([inchesToPoints(20), inchesToPoints(30)]);
    const width = page.getWidth();
    const height = page.getHeight();

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0, 0, 0) });

    if (photo) {
        const image = await embedImage(pdfDoc, photo);
        if (image) {
            const imgWidth = image.width;
            const imgHeight = image.height;
            const ratio = imgWidth / imgHeight;
            const pageRatio = width / height;
            let drawWidth = width;
            let drawHeight = height;
            if (ratio > pageRatio) {
                drawHeight = height;
                drawWidth = height * ratio;
            } else {
                drawWidth = width;
                drawHeight = width / ratio;
            }
            page.drawImage(image, {
                x: (width - drawWidth) / 2,
                y: (height - drawHeight) / 2,
                width: drawWidth,
                height: drawHeight
            });
        }
    }

    page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height: height * 0.28,
        color: rgb(0, 0, 0),
        opacity: 0.65
    });

    addCenteredText(page, name, boldFont, 72, height * 0.20, rgb(1, 1, 1));

    const qrBuffer = await fetchImageBuffer(qrCodeUrl || undefined);
    let qrSize = 90;
    let qrEmbedded = null;
    if (qrBuffer) {
        qrEmbedded = await embedImage(pdfDoc, qrBuffer);
    }

    const dateFontSize = 28;
    const textWidth = boldFont.widthOfTextAtSize(sunrise, dateFontSize);
    const totalWidth = textWidth * 2 + (qrSize + 36);
    const startX = (width - totalWidth) / 2;
    const baseY = height * 0.12;

    page.drawText(sunrise, {
        x: startX,
        y: baseY,
        size: dateFontSize,
        font: boldFont,
        color: rgb(1, 1, 1)
    });

    if (qrEmbedded) {
        page.drawImage(qrEmbedded, {
            x: startX + textWidth + 18,
            y: baseY - 10,
            width: qrSize,
            height: qrSize
        });
    }

    page.drawText(sunset, {
        x: startX + textWidth + (qrSize + 36),
        y: baseY,
        size: dateFontSize,
        font: boldFont,
        color: rgb(1, 1, 1)
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};

const sendEmailWithAttachments = async (
    to: string,
    orderNumber: string,
    orderInfo: any,
    attachments: Array<{ filename: string; content: Buffer }>
) => {
    if (!process.env.SMTP_HOST) {
        console.warn('SMTP configuration missing. Skipping email send.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        } : undefined
    });

    const deliveryLine = `Delivery Address: ${orderInfo.deliveryAddress}\nService Date: ${orderInfo.serviceDate}`;

    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'orders@dash.app',
        to,
        subject: `DASH Order ${orderNumber} - ${orderInfo.customerName}`,
        text: `Hi Print Team,\n\nPlease find attached the print-ready PDFs for order ${orderNumber}.\n\nItems:\n- 4"x6" Card (Front & Back)\n- 20"x30" Poster\n\n${deliveryLine}\n\nThank you,\nDASH`,
        attachments
    });
};

const persistOrder = async (orderInfo: any) => {
    if (!process.env.FASTAPI_URL) {
        console.warn('FASTAPI_URL not configured. Skipping persistence.');
        return;
    }
    try {
        await fetch(`${process.env.FASTAPI_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderInfo)
        });
    } catch (error) {
        console.warn('Failed to persist order to backend', error);
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, sunrise, sunset, photo, qrCodeUrl, email, orderDetails } = req.body;

        if (!name || !email || !orderDetails) {
            return res.status(400).json({ error: 'Name, email, and order details are required' });
        }

        // Order fulfillment information
        const orderInfo = {
            // Funeral Home Info
            funeralHome: orderDetails.funeralHome || 'Groman Mortuary',
            deliveryAddress: orderDetails.deliveryAddress || '830 W. Washington Blvd. Los Angeles, CA 90015',
            
            // Service Info
            funeralDirector: orderDetails.funeralDirector || 'Unknown',
            fdPhone: orderDetails.fdPhone || 'Unknown',
            serviceDate: orderDetails.serviceDate || 'TBD',
            
            // Customer Info
            customerName: orderDetails.customerName || name,
            
            // Order Info
            deliveryType: orderDetails.deliveryType || 'UBER',
            orderSource: orderDetails.orderSource || 'DASH',
            orderNumber: orderDetails.orderNumber || `${name.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`,
            
            // Products
            products: [
                {
                    type: '4"x6" Card (Front & Back)',
                    quantity: 100,
                    specifications: 'Full color, premium card stock, rounded corners'
                },
                {
                    type: '20"x30" Poster',
                    quantity: 1,
                    specifications: 'Full color, premium photo paper, mounted'
                }
            ],
            
            // Timeline
            orderDate: new Date().toISOString(),
            rushOrder: false,
            
            // Contact
            printShopEmail: 'david@dashqrcodes.com'
        };

        console.log('📧 Print order received:', {
            orderNumber: orderInfo.orderNumber,
            customer: orderInfo.customerName,
            funeralHome: orderInfo.funeralHome,
            serviceDate: orderInfo.serviceDate,
            deliveryType: orderInfo.deliveryType,
            products: orderInfo.products.map(p => `${p.quantity}x ${p.type}`).join(', ')
        });

        const [cardFrontPdf, cardBackPdf, posterPdf] = await Promise.all([
            generateCardFrontPdf({ name, sunrise, sunset, photo }),
            generateCardBackPdf({
                sunrise,
                sunset,
                qrCodeUrl,
                psalmText: orderDetails?.psalmText,
                fdName: orderDetails?.funeralDirector,
                fdPhone: orderDetails?.fdPhone
            }),
            generatePosterPdf({ name, sunrise, sunset, photo, qrCodeUrl })
        ]);

        const attachments = [
            { filename: `${orderInfo.orderNumber}-card-front.pdf`, content: Buffer.from(cardFrontPdf) },
            { filename: `${orderInfo.orderNumber}-card-back.pdf`, content: Buffer.from(cardBackPdf) },
            { filename: `${orderInfo.orderNumber}-poster.pdf`, content: Buffer.from(posterPdf) }
        ];

        await Promise.all([
            sendEmailWithAttachments(orderInfo.printShopEmail, orderInfo.orderNumber, orderInfo, attachments),
            persistOrder({ ...orderInfo, pdfGeneratedAt: new Date().toISOString() })
        ]);

        return res.status(200).json({
            success: true,
            message: 'Order sent to print shop',
            orderNumber: orderInfo.orderNumber,
            orderDetails: orderInfo
        });

    } catch (error: any) {
        console.error('Print order error:', error);
        return res.status(500).json({ 
            error: error.message || 'Failed to process print order' 
        });
    }
}

