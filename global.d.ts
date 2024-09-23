// global.d.ts (if still needed)
declare module 'cookie-parser' {
    import { RequestHandler } from 'express';
    const cookieParser: () => RequestHandler;
    export = cookieParser;
  }
  
  declare module 'ejs' {
    export function renderFile(path: string, data: any): Promise<string>;
  }
  
  declare module 'node-cron' {
    export function schedule(cronExpression: string, func: () => void): void;
  }
  
  declare module 'nodemailer' {
    import { TransportOptions, SentMessageInfo } from 'nodemailer';
    export function createTransport(options: TransportOptions): Transporter;
    export interface Transporter {
      sendMail(mailOptions: any): Promise<SentMessageInfo>;
    }
  }
  