import { createTransport } from 'nodemailer';
import { ses } from './aws';
import { config } from './config';
import logger from './winston';

const tranporter = createTransport({
  SES: ses
});

export const sendMail = async (
  to: string,
  subject: string,
  html: string,
  attachments: any[] = []
) => {
  try {
    return await tranporter.sendMail({
      from: config.awsEmailSenderId,
      to,
      subject,
      attachments,
      html,
      textEncoding: "base64",
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
}