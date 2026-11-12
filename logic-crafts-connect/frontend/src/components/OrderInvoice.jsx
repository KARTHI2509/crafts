import React, { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './OrderInvoice.css';

const OrderInvoice = ({ order }) => {
  const langContext = useLanguage();
  const language = langContext?.language || 'en';
  const invoiceRef = useRef(null);

  if (!order) return null;

  const texts = {
    en: {
      title: 'Invoice',
      orderNumber: 'Order Number',
      orderDate: 'Order Date',
      billTo: 'Bill To',
      shipTo: 'Ship To',
      paymentMethod: 'Payment Method',
      item: 'Item',
      quantity: 'Qty',
      price: 'Price',
      total: 'Total',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      discount: 'Discount',
      grandTotal: 'Grand Total',
      download: 'Download Invoice',
      print: 'Print Invoice',
      thankYou: 'Thank you for your purchase!',
      questions: 'If you have any questions, please contact us.',
      generatedOn: 'Generated on',
      invoiceNo: 'Invoice No'
    },
    ta: {
      title: 'விலைப்பட்டியல்',
      orderNumber: 'ஆர்டர் எண்',
      orderDate: 'ஆர்டர் தேதி',
      billTo: 'பில் முகவரி',
      shipTo: 'அனுப்பும் முகவரி',
      paymentMethod: 'பணம் செலுத்தும் முறை',
      item: 'பொருள்',
      quantity: 'அளவு',
      price: 'விலை',
      total: 'மொத்தம்',
      subtotal: 'துணை மொத்தம்',
      shipping: 'அனுப்புதல்',
      tax: 'வரி',
      discount: 'தள்ளுபடி',
      grandTotal: 'மொத்த தொகை',
      download: 'விலைப்பட்டியல் பதிவிறக்கு',
      print: 'விலைப்பட்டியல் அச்சிடு',
      thankYou: 'உங்கள் வாங்குதலுக்கு நன்றி!',
      questions: 'ஏதேனும் கேள்விகள் இருந்தால், எங்களைத் தொடர்பு கொள்ளவும்.',
      generatedOn: 'உருவாக்கப்பட்டது',
      invoiceNo: 'விலைப்பட்டியல் எண்'
    }
  };

  const t = texts[language] || texts.en;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handleDownload = () => {
    // Create a downloadable HTML version
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice - ${order.orderNumber || order._id}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #8B4513; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #8B4513; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { margin: 0; color: #333; }
    .invoice-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .meta-section h3 { margin: 0 0 10px; color: #8B4513; font-size: 14px; }
    .meta-section p { margin: 5px 0; color: #666; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items-table th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
    .items-table td { padding: 12px; border-bottom: 1px solid #eee; }
    .items-table .amount { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .totals-row.grand { font-weight: bold; font-size: 18px; border-top: 2px solid #8B4513; border-bottom: none; padding-top: 15px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div class="logo">Logic Crafts Connect</div>
    <div class="invoice-title">
      <h1>${t.title}</h1>
      <p>${t.invoiceNo}: INV-${order.orderNumber || order._id?.slice(-8)}</p>
    </div>
  </div>
  <div class="invoice-meta">
    <div class="meta-section">
      <h3>${t.orderNumber}</h3>
      <p>${order.orderNumber || order._id}</p>
      <h3>${t.orderDate}</h3>
      <p>${formatDate(order.createdAt)}</p>
    </div>
    <div class="meta-section">
      <h3>${t.shipTo}</h3>
      <p>${order.shippingAddress?.name || order.user?.name || 'Customer'}</p>
      <p>${order.shippingAddress?.addressLine1 || order.shippingAddress?.street || ''}</p>
      <p>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.pincode || ''}</p>
    </div>
  </div>
  <table class="items-table">
    <thead>
      <tr>
        <th>${t.item}</th>
        <th>${t.quantity}</th>
        <th class="amount">${t.price}</th>
        <th class="amount">${t.total}</th>
      </tr>
    </thead>
    <tbody>
      ${(order.items || order.products || []).map(item => `
        <tr>
          <td>${item.name || item.craft?.name || item.product?.name || 'Product'}</td>
          <td>${item.quantity}</td>
          <td class="amount">₹${(item.price || 0).toLocaleString()}</td>
          <td class="amount">₹${((item.price || 0) * item.quantity).toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="totals">
    <div class="totals-row">
      <span>${t.subtotal}</span>
      <span>₹${(order.subtotal || order.totalAmount || 0).toLocaleString()}</span>
    </div>
    <div class="totals-row">
      <span>${t.shipping}</span>
      <span>₹${(order.shippingCost || 0).toLocaleString()}</span>
    </div>
    ${order.discount ? `
    <div class="totals-row">
      <span>${t.discount}</span>
      <span>-₹${order.discount.toLocaleString()}</span>
    </div>
    ` : ''}
    <div class="totals-row grand">
      <span>${t.grandTotal}</span>
      <span>₹${(order.totalAmount || order.total || 0).toLocaleString()}</span>
    </div>
  </div>
  <div class="footer">
    <p>${t.thankYou}</p>
    <p>${t.questions}</p>
    <p style="font-size: 12px; margin-top: 20px;">${t.generatedOn}: ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.orderNumber || order._id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const items = order.items || order.products || [];
  const subtotal = order.subtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = order.shippingCost || 0;
  const discount = order.discount || 0;
  const total = order.totalAmount || order.total || (subtotal + shipping - discount);

  return (
    <div className="order-invoice-wrapper">
      {/* Action Buttons */}
      <div className="invoice-actions">
        <button className="btn-download" onClick={handleDownload}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {t.download}
        </button>
        <button className="btn-print" onClick={handlePrint}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          {t.print}
        </button>
      </div>

      {/* Invoice Preview */}
      <div className="invoice-container" ref={invoiceRef}>
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-logo">
            <span className="logo-text">Logic Crafts Connect</span>
            <span className="logo-tagline">Handcrafted with Love</span>
          </div>
          <div className="invoice-title-section">
            <h1>{t.title}</h1>
            <p className="invoice-number">{t.invoiceNo}: INV-{order.orderNumber || order._id?.slice(-8)}</p>
          </div>
        </div>

        {/* Meta Information */}
        <div className="invoice-meta">
          <div className="meta-box">
            <h3>{t.orderNumber}</h3>
            <p>{order.orderNumber || order._id}</p>
          </div>
          <div className="meta-box">
            <h3>{t.orderDate}</h3>
            <p>{formatDate(order.createdAt)}</p>
          </div>
          <div className="meta-box">
            <h3>{t.paymentMethod}</h3>
            <p>{order.paymentMethod || 'Online Payment'}</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="invoice-addresses">
          <div className="address-box">
            <h3>{t.shipTo}</h3>
            <p className="name">{order.shippingAddress?.name || order.user?.name}</p>
            <p>{order.shippingAddress?.addressLine1 || order.shippingAddress?.street}</p>
            {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
            {order.shippingAddress?.phone && <p>Phone: {order.shippingAddress.phone}</p>}
          </div>
        </div>

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th className="col-item">{t.item}</th>
              <th className="col-qty">{t.quantity}</th>
              <th className="col-price">{t.price}</th>
              <th className="col-total">{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="col-item">
                  <div className="item-info">
                    {item.image && <img src={item.image} alt={item.name} />}
                    <span>{item.name || item.craft?.name || item.product?.name || 'Product'}</span>
                  </div>
                </td>
                <td className="col-qty">{item.quantity}</td>
                <td className="col-price">₹{(item.price || 0).toLocaleString()}</td>
                <td className="col-total">₹{((item.price || 0) * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="invoice-totals">
          <div className="totals-row">
            <span>{t.subtotal}</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="totals-row">
            <span>{t.shipping}</span>
            <span>₹{shipping.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="totals-row discount">
              <span>{t.discount}</span>
              <span>-₹{discount.toLocaleString()}</span>
            </div>
          )}
          <div className="totals-row grand-total">
            <span>{t.grandTotal}</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p className="thank-you">{t.thankYou}</p>
          <p className="questions">{t.questions}</p>
          <p className="generated-date">{t.generatedOn}: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoice;
