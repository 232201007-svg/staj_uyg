import './globals.css';
import Navbar from './Navbar';

export const metadata = {
  title: 'Auth Project',
  description: 'Premium Auth Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="antialiased bg-slate-50 text-slate-900">
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}