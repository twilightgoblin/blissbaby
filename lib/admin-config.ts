// Admin configuration using environment variables
export function getAdminConfig() {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
  const allowSelfService = process.env.ALLOW_SELF_SERVICE_ADMIN === 'true'
  const firstUserAutoAdmin = process.env.FIRST_USER_AUTO_ADMIN === 'true'

  return {
    ALLOWED_ADMIN_EMAILS: adminEmails,
    ALLOW_SELF_SERVICE_ADMIN: allowSelfService,
    FIRST_USER_AUTO_ADMIN: firstUserAutoAdmin,
  }
}

export function isEmailAllowedAsAdmin(email: string): boolean {
  const config = getAdminConfig()
  return config.ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase())
}

export function shouldAllowSelfServiceAdmin(): boolean {
  const config = getAdminConfig()
  return config.ALLOW_SELF_SERVICE_ADMIN
}

export function shouldAllowFirstUserAutoAdmin(): boolean {
  const config = getAdminConfig()
  return config.FIRST_USER_AUTO_ADMIN
}