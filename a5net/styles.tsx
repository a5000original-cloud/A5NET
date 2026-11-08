import { jsx } from '@app/html-jsx'
import AppCss from './app.css'

export function Styles() {
  return (
    <>
      <meta name="theme-color" content="#070806" />
      <link rel="manifest" href="/a5net/manifest" />
      <link rel="apple-touch-icon" href="https://fs.chatium.ru/get/image_msk_abI7qVATB7.192x192.png" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="A5NET" />
      <AppCss />
    </>
  )
}
