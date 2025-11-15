const twilio = require('twilio');
const logger = require('../utils/logger');

class TwilioService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., whatsapp:+14155238886
    this.smsNumber = process.env.TWILIO_SMS_NUMBER; // e.g., +1234567890
    
    // Only initialize if credentials are provided
    if (this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
      this.enabled = true;
      logger.info('✅ Twilio service initialized');
    } else {
      this.enabled = false;
      logger.warn('⚠️  Twilio credentials not found - SMS/WhatsApp disabled');
    }
  }

  /**
   * Send WhatsApp message
   * @param {string} to - Recipient WhatsApp number (with country code, e.g., +919876543210)
   * @param {string} message - Message content
   * @returns {Promise<object>} Twilio response
   */
  async sendWhatsApp(to, message) {
    if (!this.enabled) {
      logger.warn('Twilio not enabled - WhatsApp message not sent');
      return { success: false, error: 'Twilio not configured' };
    }

    try {
      // Format number for WhatsApp (add whatsapp: prefix)
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
      const response = await this.client.messages.create({
        from: this.whatsappNumber,
        to: formattedTo,
        body: message
      });

      logger.info(`✅ WhatsApp sent to ${to}: ${response.sid}`);
      return { success: true, messageId: response.sid, response };
    } catch (error) {
      logger.error(`❌ WhatsApp send failed to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS message
   * @param {string} to - Recipient phone number (with country code)
   * @param {string} message - Message content
   * @returns {Promise<object>} Twilio response
   */
  async sendSMS(to, message) {
    if (!this.enabled) {
      logger.warn('Twilio not enabled - SMS not sent');
      return { success: false, error: 'Twilio not configured' };
    }

    try {
      const response = await this.client.messages.create({
        from: this.smsNumber,
        to: to,
        body: message
      });

      logger.info(`✅ SMS sent to ${to}: ${response.sid}`);
      return { success: true, messageId: response.sid, response };
    } catch (error) {
      logger.error(`❌ SMS send failed to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send WhatsApp with fallback to SMS
   * @param {string} whatsappNumber - WhatsApp number
   * @param {string} phoneNumber - Fallback phone number
   * @param {string} message - Message content
   * @returns {Promise<object>}
   */
  async sendWithFallback(whatsappNumber, phoneNumber, message) {
    // Try WhatsApp first
    if (whatsappNumber) {
      const result = await this.sendWhatsApp(whatsappNumber, message);
      if (result.success) {
        return result;
      }
      logger.warn('WhatsApp failed, trying SMS fallback');
    }

    // Fallback to SMS
    if (phoneNumber) {
      return await this.sendSMS(phoneNumber, message);
    }

    return { success: false, error: 'No valid phone numbers provided' };
  }

  /**
   * Send bulk messages (rate-limited)
   * @param {Array} recipients - Array of {to, message} objects
   * @param {string} type - 'whatsapp' or 'sms'
   * @returns {Promise<object>} Summary results
   */
  async sendBulk(recipients, type = 'whatsapp') {
    const results = {
      total: recipients.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const recipient of recipients) {
      try {
        const result = type === 'whatsapp'
          ? await this.sendWhatsApp(recipient.to, recipient.message)
          : await this.sendSMS(recipient.to, recipient.message);

        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push({ to: recipient.to, error: result.error });
        }

        // Rate limiting: wait 100ms between messages
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.failed++;
        results.errors.push({ to: recipient.to, error: error.message });
      }
    }

    logger.info(`Bulk ${type} send complete: ${results.successful}/${results.total} successful`);
    return results;
  }

  /**
   * Format task notification message
   * @param {object} task - Task object
   * @param {object} employee - Employee object
   * @returns {string} Formatted message
   */
  formatTaskNotification(task, employee) {
    const priority = task.priority.toUpperCase();
    const emoji = {
      urgent: '🚨',
      high: '⚠️',
      medium: '📌',
      low: '📝'
    }[task.priority] || '📌';

    let message = `${emoji} *New Task Assigned*\n\n`;
    message += `Hello ${employee.firstName},\n\n`;
    message += `*Task:* ${task.title}\n`;
    message += `*Priority:* ${priority}\n`;
    
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate).toLocaleDateString();
      message += `*Due:* ${dueDate}\n`;
    }
    
    if (task.description) {
      message += `*Details:* ${task.description}\n`;
    }

    message += `\nPlease complete this task on time.`;
    message += `\n\n- CropWise`;

    return message;
  }

  /**
   * Format daily summary message
   * @param {object} employee - Employee object
   * @param {Array} tasks - Array of tasks
   * @returns {string} Formatted message
   */
  formatDailySummary(employee, tasks) {
    let message = `🌱 *Good Morning, ${employee.firstName}!*\n\n`;
    message += `Here are your tasks for today:\n\n`;

    if (tasks.length === 0) {
      message += `✅ No tasks assigned for today. Enjoy your day!\n`;
    } else {
      tasks.forEach((task, index) => {
        const emoji = {
          urgent: '🚨',
          high: '⚠️',
          medium: '📌',
          low: '📝'
        }[task.priority] || '📌';
        
        message += `${index + 1}. ${emoji} *[${task.priority.toUpperCase()}]* ${task.title}\n`;
        
        if (task.dueTime) {
          message += `   ⏰ Due: ${task.dueTime}\n`;
        }
      });

      message += `\n*Total: ${tasks.length} tasks*\n`;
    }

    message += `\nHave a productive day! 🚀`;
    message += `\n\n- CropWise`;

    return message;
  }

  /**
   * Format alert notification
   * @param {object} alert - Alert object
   * @param {object} employee - Employee object
   * @returns {string} Formatted message
   */
  formatAlertNotification(alert, employee) {
    const emoji = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️'
    }[alert.severity] || 'ℹ️';

    let message = `${emoji} *${alert.severity.toUpperCase()} ALERT*\n\n`;
    message += `${employee.firstName}, attention required!\n\n`;
    message += `*${alert.title}*\n`;
    message += `${alert.message}\n`;
    
    if (alert.actionUrl) {
      message += `\nTake action: ${alert.actionUrl}`;
    }

    message += `\n\n- CropWise`;

    return message;
  }

  /**
   * Check if Twilio is enabled and configured
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get service status
   * @returns {object} Status information
   */
  getStatus() {
    return {
      enabled: this.enabled,
      whatsappConfigured: !!this.whatsappNumber,
      smsConfigured: !!this.smsNumber,
      accountSid: this.accountSid ? `${this.accountSid.substring(0, 10)}...` : 'Not set'
    };
  }
}

// Export singleton instance
module.exports = new TwilioService();

