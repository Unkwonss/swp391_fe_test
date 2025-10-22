import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">⚡ EV Market</h3>
            <p className="text-gray-400">
              Nền tảng mua bán xe điện và pin đã qua sử dụng uy tín hàng đầu Việt Nam.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white">Trang chủ</Link></li>
              <li><Link href="/search" className="hover:text-white">Tìm kiếm</Link></li>
              <li><Link href="/subscription" className="hover:text-white">Gói dịch vụ</Link></li>
              <li><Link href="/about" className="hover:text-white">Giới thiệu</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/help" className="hover:text-white">Trung tâm hỗ trợ</Link></li>
              <li><Link href="/terms" className="hover:text-white">Điều khoản</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Chính sách</Link></li>
              <li><Link href="/contact" className="hover:text-white">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📧 support@evmarket.vn</li>
              <li>📞 1900-xxxx</li>
              <li>📍 Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-gray-700" />

        <div className="text-center text-gray-400">
          <p>&copy; 2025 EV Market. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
