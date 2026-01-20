import UserTable from '@/components/admin/UserTable';

export default function AdminUsers() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">จัดการผู้ใช้</h1>
        <p className="text-gray-500">ดูรายชื่อผู้ใช้ทั้งหมด แบน/ปลดแบน และเปลี่ยน Role</p>
      </div>
      
      <UserTable />
    </div>
  );
}
