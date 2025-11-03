// Automated Print Shop Delivery System
class PrintShopDelivery {
    constructor() {
        this.printShopEmail = 'elartededavid@gmail.com';
        this.orderTemplate = this.createOrderTemplate();
    }
    
    createOrderTemplate() {
        return {
            subject: 'DASH Memorial Order - {orderId}',
            body: `
DASH Memorial Order #{orderId}

CUSTOMER INFORMATION:
Name: {customerName}
Phone: {customerPhone}
Email: {customerEmail}

MEMORIAL DETAILS:
Loved One: {lovedOneName}
Sunrise: {sunriseDate}
Sunset: {sunsetDate}

ORDER SPECIFICATIONS:
- 4"x6" Memorial Cards (Front & Back)
- 3/16" white border (Groman Mortuary spec)
- QR Code: {qrUrl}
- Print Quality: 300 DPI
- Quantity: {quantity}

FILES ATTACHED:
- Front side PDF
- Back side PDF
- Print specifications

DELIVERY:
Due Date: {dueDate}
Rush Order: {isRush}

PAYMENT:
Amount: ${amount}
Status: Paid (via DASH)

Please confirm receipt and provide estimated completion time.

Best regards,
DASH Memorial Platform
            `
        };
    }
    
    async sendOrder(orderData) {
        const emailData = this.formatEmail(orderData);
        
        // Method 1: Email API (recommended)
        if (this.hasEmailAPI()) {
            return await this.sendViaEmailAPI(emailData);
        }
        
        // Method 2: Generate email for manual sending
        return this.generateEmailForManualSend(emailData);
    }
    
    formatEmail(orderData) {
        const template = this.orderTemplate;
        const orderId = this.generateOrderId();
        
        return {
            to: this.printShopEmail,
            subject: template.subject.replace('{orderId}', orderId),
            body: template.body
                .replace('{orderId}', orderId)
                .replace('{customerName}', orderData.customerName || 'N/A')
                .replace('{customerPhone}', orderData.customerPhone || 'N/A')
                .replace('{customerEmail}', orderData.customerEmail || 'N/A')
                .replace('{lovedOneName}', orderData.lovedOneName)
                .replace('{sunriseDate}', orderData.sunriseDate)
                .replace('{sunsetDate}', orderData.sunsetDate)
                .replace('{qrUrl}', orderData.qrUrl)
                .replace('{quantity}', orderData.quantity || '50')
                .replace('{dueDate}', orderData.dueDate || 'ASAP')
                .replace('{isRush}', orderData.isRush ? 'YES' : 'NO')
                .replace('{amount}', orderData.amount || '$250'),
            attachments: orderData.pdfFiles || []
        };
    }
    
    generateOrderId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `DASH-${timestamp}-${random}`.toUpperCase();
    }
    
    generateEmailForManualSend(emailData) {
        const mailtoLink = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        
        // Open email client
        window.open(mailtoLink);
        
        return {
            success: true,
            method: 'manual',
            orderId: emailData.subject.split('#')[1],
            message: 'Email client opened for manual sending'
        };
    }
    
    hasEmailAPI() {
        // Check if email service is configured
        return false; // Set to true when email API is integrated
    }
    
    async sendViaEmailAPI(emailData) {
        // Integration with SendGrid, Mailgun, etc.
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Email API error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrintShopDelivery;
}
// Make available globally for browser scripts
if (typeof window !== 'undefined') {
    window.PrintShopDelivery = PrintShopDelivery;
}
