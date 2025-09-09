import { jsxRenderer } from 'hono/jsx-renderer'

/**
 * A middleware for Hono that wraps the rendered JSX in a basic HTML structure.
 * It includes a link to the main stylesheet.
 * @param {object} props - The properties passed to the component.
 * @param {JSX.Element} props.children - The child elements to render inside the body.
 * @returns {JSX.Element} The HTML structure with the children embedded.
 */
export const renderer = jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
})
