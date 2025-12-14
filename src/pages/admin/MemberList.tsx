import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, fetchJson } from '../../lib/api';
import { Member } from '../../types';

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await fetchJson<Member[] | { data: Member[] }>(`${API_URL}/admin/members`);

      // Kalau suatu saat Anda ubah ke pagination Laravel (resource collection),
      // biasanya responsenya { data: [...] }
      const list = Array.isArray(data) ? data : data.data ?? [];
      setMembers(list);
    } catch (error) {
      console.error('Gagal memuat member', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers();
  }, []);

  const handleDelete = async (id: number) => {
    const ok = window.confirm('Hapus member ini?');
    if (!ok) return;

    try {
      await fetchJson(`${API_URL}/admin/members/${id}`, {
        method: 'DELETE',
      });

      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Gagal menghapus member', error);
      alert('Gagal menghapus member. Coba lagi.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Members</h1>
          <p className="text-sm text-gray-500">Kelola data member dan poin mereka.</p>
        </div>
        <Link
          to="/admin/members/new"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
        >
          + Tambah Member
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Memuat data...</div>
        ) : members.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Belum ada member.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telepon
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poin
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-4 py-2 text-sm text-gray-800">{member.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{member.phone}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{member.email || '-'}</td>
                  <td className="px-4 py-2 text-sm text-right text-gray-800">
                    {member.points.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-2 text-sm text-right space-x-2">
                    <Link
                      to={`/admin/members/${member.id}/edit`}
                      className="inline-flex items-center px-2 py-1 text-xs rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="inline-flex items-center px-2 py-1 text-xs rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
