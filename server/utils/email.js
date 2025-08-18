const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development configuration (using ethereal email for testing)
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Send email function
exports.sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Kisaan Team'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message.replace(/\n/g, '<br>')
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === 'development') {
      console.log('Email sent:', {
        messageId: info.messageId,
        previewURL: nodemailer.getTestMessageUrl(info)
      });
    }

    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Email could not be sent');
  }
};

// Send welcome email
exports.sendWelcomeEmail = async (user) => {
  const message = `
    Welcome to Kisaan, ${user.name}!
    
    Thank you for joining our agricultural marketplace platform.
    
    ${user.role === 'farmer' 
      ? 'As a farmer, you can now list your grains for sale and reach buyers across the region.'
      : 'As a buyer, you can now browse and purchase high-quality grains directly from farmers.'
    }
    
    Getting Started:
    ${user.role === 'farmer' 
      ? '1. Complete your profile\n2. List your first grain\n3. Wait for approval\n4. Start receiving orders'
      : '1. Complete your profile\n2. Browse grain listings\n3. Place your first order\n4. Enjoy fresh grains'
    }
    
    If you have any questions, our support team is here to help.
    
    Best regards,
    The Kisaan Team
  `;

  return await this.sendEmail({
    email: user.email,
    subject: 'Welcome to Kisaan - Get Started Today!',
    message
  });
};

// Send order confirmation email
exports.sendOrderConfirmationEmail = async (order, user, type = 'buyer') => {
  const isBuyer = type === 'buyer';
  
  const message = `
    Dear ${user.name},
    
    ${isBuyer ? 'Your order has been placed successfully!' : 'You have received a new order!'}
    
    Order Details:
    - Order ID: ${order._id}
    - Grain: ${order.grain.title}
    - Quantity: ${order.quantity} quintals
    - Price per Quintal: ₹${order.pricePerQuintal}
    - Total Amount: ₹${order.totalAmount}
    - ${isBuyer ? 'Farmer' : 'Buyer'}: ${isBuyer ? order.farmer.name : order.buyer.name}
    - ${isBuyer ? 'Farmer Contact' : 'Buyer Contact'}: ${isBuyer ? order.farmer.phone : order.buyer.phone}
    
    ${isBuyer 
      ? 'You will receive updates about your order status. Thank you for choosing Kisaan!'
      : 'Please login to your dashboard to confirm this order.'
    }
    
    Best regards,
    Kisaan Team
  `;

  return await this.sendEmail({
    email: user.email,
    subject: `${isBuyer ? 'Order Confirmation' : 'New Order Received'} - Kisaan`,
    message
  });
};

// Send grain approval/rejection email
exports.sendGrainStatusEmail = async (grain, farmer, status, adminNotes = '') => {
  const isApproved = status === 'approved';
  
  const message = `
    Dear ${farmer.name},
    
    Your grain listing "${grain.title}" has been ${isApproved ? 'approved' : 'rejected'}.
    
    ${isApproved 
      ? 'Congratulations! Your grain is now live on Kisaan and buyers can start placing orders.'
      : `Unfortunately, your listing could not be approved at this time.`
    }
    
    ${adminNotes ? `Admin Notes: ${adminNotes}` : ''}
    
    ${isApproved 
      ? 'You can track orders and manage your listing from your farmer dashboard.'
      : 'Please review our listing guidelines and submit a new listing with the required improvements.'
    }
    
    Best regards,
    Kisaan Team
  `;

  return await this.sendEmail({
    email: farmer.email,
    subject: `Grain Listing ${isApproved ? 'Approved' : 'Rejected'} - Kisaan`,
    message
  });
};

// Send order status update email
exports.sendOrderStatusEmail = async (order, recipient, newStatus) => {
  const statusMessages = {
    confirmed: 'has been confirmed by the farmer',
    paid: 'payment has been received',
    shipped: 'has been shipped',
    delivered: 'has been delivered successfully',
    cancelled: 'has been cancelled'
  };

  const message = `
    Dear ${recipient.name},
    
    Your order #${order._id} ${statusMessages[newStatus] || `status has been updated to ${newStatus}`}.
    
    Order Details:
    - Grain: ${order.grain.title}
    - Quantity: ${order.quantity} quintals
    - Total Amount: ₹${order.totalAmount}
    
    ${newStatus === 'delivered' 
      ? 'Thank you for your business! Please consider rating your experience.'
      : 'You can track your order status in your dashboard.'
    }
    
    Best regards,
    Kisaan Team
  `;

  return await this.sendEmail({
    email: recipient.email,
    subject: `Order Update - ${order.grain.title}`,
    message
  });
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetUrl) => {
  const message = `
    Dear ${user.name},
    
    You are receiving this email because you (or someone else) has requested a password reset for your Kisaan account.
    
    Please click on the following link to reset your password:
    ${resetUrl}
    
    If you did not request this password reset, please ignore this email and your password will remain unchanged.
    
    This link will expire in 10 minutes for security reasons.
    
    Best regards,
    Kisaan Team
  `;

  return await this.sendEmail({
    email: user.email,
    subject: 'Password Reset Request - Kisaan',
    message
  });
};

// Send notification email template
exports.sendNotificationEmail = async (user, subject, content) => {
  const message = `
    Dear ${user.name},
    
    ${content}
    
    Best regards,
    Kisaan Team
  `;

  return await this.sendEmail({
    email: user.email,
    subject: `${subject} - Kisaan`,
    message
  });
};
