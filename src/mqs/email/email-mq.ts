import Queue from "bull";
import pug from "pug";
import path from "path";
import { config } from '../../config';
import { MessageQueue } from '../../const/mq/mq';
import logger from "../../winston";
import { sendMail } from '../../nodemailer';
import { SEND_OTP_SUBJECT } from '../../const/email/email-subject-const';

export const EmailQ = new Queue(MessageQueue.EmailQ, { redis: config.redis });

export enum EmailQType {
  SEND_OTP = 'SEND_OTP'
};

EmailQ.isReady().then(() => {
  EmailQ.process(async ({ data: { type, email, otp } }: { data: { type: EmailQType, email: string, otp?: string } }) => {
    try {
      switch (type) {
        case EmailQType.SEND_OTP:
          try {
            const html = pug.compileFile(path.resolve(`src/templates/user-otp.pug`))(
              {
                otp,
                url: `https://app.ediflo.co/signup?email=${email}&step=2`
              }
            );
            await sendMail(email, SEND_OTP_SUBJECT, html);
          } catch (error) {
            throw error;
          }
      }
      return Promise.resolve();
    } catch (error) {
      logger.error(error.message)
      return Promise.resolve()
    }
  });
}).catch((err: Error) => {
  logger.error(err.message);
});

EmailQ.on('completed', ({ id }) => {
  logger.info(`${id} completed`)
});
EmailQ.on('error', (err: Error) => {
  logger.error(err.message)
});