import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Adhyaya",
  description: "Smart Library & Study Room Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden bg-gradient-to-br from-red-300 via-blue-50 to-black text-slate-900 antialiased">
        <div className="relative min-h-screen overflow-hidden">

          {/* background blobs */}
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-200 blur-3xl" />
            <div className="absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-indigo-200 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-100 blur-3xl" />
          </div>

          <main className="relative z-10">
            {children}
            <Navbar/>
          </main>
        </div>
      </body>
    </html>
  );
}