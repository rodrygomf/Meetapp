/**
 * @author Rodrigo Figueiredo
 * @since  12/07/2019
 */

export default {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  default: {
    from: 'Meetapp <noreply@meetapp.com>',
  },
};
