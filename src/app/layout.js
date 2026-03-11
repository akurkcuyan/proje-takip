import "./globals.css";

export const metadata = {
  title: "Proje Takip | Ses Sistemi Takip Sistemi",
  description: "İthalat, Satış ve Montaj Süreçleri İçin Premium Takip Sistemi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
