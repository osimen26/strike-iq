// The master VIP administrator accounts authorized to manage AI predictions and platform config
export const MASTER_ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ?? "osimenvictor04@gmail.com"
).split(",").map(e => e.trim().toLowerCase());

export const MASTER_ADMIN_EMAIL = MASTER_ADMIN_EMAILS[0];
