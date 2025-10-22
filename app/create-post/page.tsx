'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { createListing, getMySubscription } from '@/lib/api';
import type { User, UserSubscription } from '@/lib/types';

const CATEGORIES = [
  { id: 1, name: 'Xe điện' },
  { id: 2, name: 'Xe máy điện' },
  { id: 3, name: 'Pin xe điện' },
];

export default function CreatePostPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [categoryId, setCategoryId] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  
  // EV-specific (Xe điện)
  const [seats, setSeats] = useState('');
  const [mileage, setMileage] = useState('');
  const [batteryCapacity, setBatteryCapacity] = useState('');
  
  // Battery-specific (Pin)
  const [cycleCount, setCycleCount] = useState('');
  const [warrantyInfo, setWarrantyInfo] = useState('');
  const [voltage, setVoltage] = useState('');
  
  // Images
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Reset form fields khi đổi category
  useEffect(() => {
    // Reset category-specific fields
    if (categoryId === 2) {
      // Xe máy điện - mặc định 2 chỗ ngồi
      setSeats('2');
    } else if (categoryId === 1) {
      // Xe điện - reset về rỗng để user nhập
      if (seats === '2') setSeats('');
    } else if (categoryId === 3) {
      // Pin - clear EV fields
      setSeats('');
      setMileage('');
    }
  }, [categoryId]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const sub = await getMySubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      alert('Tối đa 5 ảnh!');
      return;
    }

    setFiles([...files, ...selectedFiles]);
    
    // Create previews
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vui lòng đăng nhập!');
      return;
    }

    if (files.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh!');
      return;
    }

    setLoading(true);

    try {
      const listingData: any = {
        title,
        description,
        price: Number(price),
        categoryId,
        brand,
        model,
        year: year ? Number(year) : undefined,
        color,
      };

      // Add category-specific fields
      if (categoryId === 1 || categoryId === 2) {
        // EV fields
        if (seats) listingData.seats = Number(seats);
        if (mileage) listingData.mileage = Number(mileage);
        if (batteryCapacity) listingData.batteryCapacity = batteryCapacity;
      } else if (categoryId === 3) {
        // Battery fields
        if (cycleCount) listingData.cycleCount = Number(cycleCount);
        if (voltage) listingData.voltage = Number(voltage);
        if (batteryCapacity) listingData.batteryCapacity = batteryCapacity;
        if (warrantyInfo) listingData.warrantyInfo = warrantyInfo;
      }

      await createListing(listingData, files);
      
      alert('Đăng tin thành công! Tin của bạn đang chờ duyệt.');
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Đăng tin thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Đăng tin mới</h1>

      {subscription && subscription.subscription.subName === 'Free' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Gói Free:</strong> Bạn chỉ có thể đăng 1 tin. Nâng cấp gói để đăng không giới hạn!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Danh mục <span className="text-red-500">*</span></label>
            <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} className="input-field" required>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Tiêu đề <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="VD: Xe điện VinFast VF8 2023 còn mới 99%"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Mô tả <span className="text-red-500">*</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              rows={6}
              placeholder="Mô tả chi tiết về sản phẩm..."
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Giá <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
              placeholder="Nhập giá (VNĐ)"
              required
            />
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin chi tiết</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 font-medium">Thương hiệu</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="input-field"
                placeholder="VD: VinFast, Tesla"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="input-field"
                placeholder="VD: VF8, Model 3"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 font-medium">Năm sản xuất</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="input-field"
                placeholder="2023"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Màu sắc</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="input-field"
                placeholder="Đen, Trắng..."
              />
            </div>
          </div>

          {/* Xe điện (ô tô điện) */}
          {categoryId === 1 && (
            <>
              <div className="bg-blue-50 p-3 rounded mb-4">
                <p className="text-sm text-blue-800">📌 Thông tin chi tiết cho <strong>Xe điện (ô tô)</strong></p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 font-medium">Số chỗ ngồi</label>
                  <input
                    type="number"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="input-field"
                    placeholder="4, 5, 7..."
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Quãng đường đã đi (km)</label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="input-field"
                    placeholder="10000"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">Dung lượng pin</label>
                <input
                  type="text"
                  value={batteryCapacity}
                  onChange={(e) => setBatteryCapacity(e.target.value)}
                  className="input-field"
                  placeholder="87.7 kWh, 100 kWh..."
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">Bảo hành</label>
                <input
                  type="text"
                  value={warrantyInfo}
                  onChange={(e) => setWarrantyInfo(e.target.value)}
                  className="input-field"
                  placeholder="Còn 12 tháng, 24 tháng..."
                />
              </div>
            </>
          )}

          {/* Xe máy điện */}
          {categoryId === 2 && (
            <>
              <div className="bg-green-50 p-3 rounded mb-4">
                <p className="text-sm text-green-800">📌 Thông tin chi tiết cho <strong>Xe máy điện</strong></p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 font-medium">Số chỗ ngồi</label>
                  <input
                    type="number"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="input-field"
                    placeholder="2"
                    disabled
                    title="Xe máy điện mặc định 2 chỗ ngồi"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mặc định: 2 chỗ ngồi</p>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Quãng đường đã đi (km)</label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="input-field"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">Dung lượng pin</label>
                <input
                  type="text"
                  value={batteryCapacity}
                  onChange={(e) => setBatteryCapacity(e.target.value)}
                  className="input-field"
                  placeholder="1.5 kWh, 2.5 kWh..."
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">Bảo hành</label>
                <input
                  type="text"
                  value={warrantyInfo}
                  onChange={(e) => setWarrantyInfo(e.target.value)}
                  className="input-field"
                  placeholder="Còn 6 tháng, 12 tháng..."
                />
              </div>
            </>
          )}

          {/* Pin xe điện */}
          {categoryId === 3 && (
            <>
              <div className="bg-yellow-50 p-3 rounded mb-4">
                <p className="text-sm text-yellow-800">📌 Thông tin chi tiết cho <strong>Pin xe điện</strong></p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 font-medium">Dung lượng pin</label>
                  <input
                    type="text"
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(e.target.value)}
                    className="input-field"
                    placeholder="60 kWh, 80 kWh..."
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Điện áp (V)</label>
                  <input
                    type="number"
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                    className="input-field"
                    placeholder="400, 800..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 font-medium">Số chu kỳ sạc</label>
                  <input
                    type="number"
                    value={cycleCount}
                    onChange={(e) => setCycleCount(e.target.value)}
                    className="input-field"
                    placeholder="500, 1000..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Số lần đã sạc pin</p>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Bảo hành</label>
                  <input
                    type="text"
                    value={warrantyInfo}
                    onChange={(e) => setWarrantyInfo(e.target.value)}
                    className="input-field"
                    placeholder="Còn 12 tháng"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Hình ảnh <span className="text-red-500">*</span></h2>
          <p className="text-sm text-gray-600 mb-4">Tối đa 5 ảnh</p>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="mb-4"
            disabled={files.length >= 5}
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-4 mt-4">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative">
                  <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Đang đăng...' : 'Đăng tin'}
        </button>
      </form>
    </div>
  );
}
