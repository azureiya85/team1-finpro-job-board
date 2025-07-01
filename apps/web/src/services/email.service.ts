// Re-export everything from the other email service files
export * from './email-core.service';
export * from './email-templates.service';

// Re-export the main emailService object
export { emailService } from './email-templates.service';