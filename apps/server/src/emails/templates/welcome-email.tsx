/** @jsx jsx */
/** @jsxImportSource hono/jsx */

// this is just a placeholder file for welcome email template
import { jsx } from 'hono/jsx'

export const WelcomeEmail = ({ name }: { name: string }) => {
  return (
    <html>
      <body>
        <h1>Welcome to S.T.E.P.S, {name}!</h1>
        <p>We're excited to have you on board. Let's get started on your journey!</p>
      </body>
    </html>
  )
}