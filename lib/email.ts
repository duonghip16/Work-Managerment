// Email service for sending verification and password reset emails
export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // In production, integrate with services like SendGrid, AWS SES, or Nodemailer
  // For now, we'll simulate email sending
  console.log('📧 Email sent:', {
    to: options.to,
    subject: options.subject,
    preview: options.html.substring(0, 100) + '...'
  })
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 1000))
  return true
}

export const generateVerificationEmailHTML = (verificationLink: string, userName: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Xác thực email - TaskFlow</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #333; text-align: center;">TaskFlow</h1>
        <h2 style="color: #555;">Xác thực địa chỉ email của bạn</h2>
        
        <p>Xin chào ${userName},</p>
        
        <p>Cảm ơn bạn đã đăng ký TaskFlow! Để hoàn tất quá trình đăng ký, vui lòng xác thực địa chỉ email của bạn bằng cách nhấp vào nút bên dưới:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Xác thực Email
          </a>
        </div>
        
        <p>Hoặc copy và paste link sau vào trình duyệt:</p>
        <p style="word-break: break-all; color: #007bff;">${verificationLink}</p>
        
        <p>Link này sẽ hết hạn sau 24 giờ.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          Nếu bạn không đăng ký tài khoản TaskFlow, vui lòng bỏ qua email này.
        </p>
      </div>
    </body>
    </html>
  `
}

export const generatePasswordResetEmailHTML = (resetLink: string, userName: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Đặt lại mật khẩu - TaskFlow</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #333; text-align: center;">TaskFlow</h1>
        <h2 style="color: #555;">Đặt lại mật khẩu</h2>
        
        <p>Xin chào ${userName},</p>
        
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản TaskFlow của bạn. Nhấp vào nút bên dưới để tạo mật khẩu mới:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Đặt lại mật khẩu
          </a>
        </div>
        
        <p>Hoặc copy và paste link sau vào trình duyệt:</p>
        <p style="word-break: break-all; color: #dc3545;">${resetLink}</p>
        
        <p>Link này sẽ hết hạn sau 1 giờ.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        </p>
      </div>
    </body>
    </html>
  `
}