import { Navbar } from "@/components/Navbar";

// Loading skeleton untuk halaman /order
// Next.js App Router otomatis tampilkan ini saat navigasi ke /order
export default function OrderLoading() {
  return (
    <div className="min-h-screen px-4 sm:px-6 pt-16 pb-10">
      <div className="max-w-2xl mx-auto">
        <Navbar backButton />
        <div className="skeleton h-8 w-40 rounded-lg mb-2 mt-6" />
        <div className="skeleton h-4 w-56 rounded mb-6" />
        <div className="skeleton h-12 w-full rounded-xl mb-8" />
        <div className="space-y-3">
          <div className="skeleton h-20 rounded-xl" />
          <div className="skeleton h-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
