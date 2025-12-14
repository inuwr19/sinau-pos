import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, fetchJson } from '../../lib/api';
import { Member } from '../../types';

export default function MemberForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    points: 0,
  });

  const [loading, setLoading] = useState<boolean>(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const member = await fetchJson<Member>(`${API_URL}/admin/members/${id}`);
        setForm({
          name: member.name,
          phone: member.phone,
          email: member.email || '',
          points: member.points ?? 0,
        });
      } catch (err) {
        console.error('Gagal memuat member', err);
        setError('Gagal memuat data member.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'points' ? Number(value || 0) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        points: form.points,
      };

      const url = isEdit ? `${API_URL}/admin/members/${id}` : `${API_URL}/admin/members`;

      const method = isEdit ? 'PUT' : 'POST';

      await fetchJson<Member>(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      navigate('/admin/members');
    } catch (err) {
      console.error('Gagal menyimpan member', err);
      setError('Gagal menyimpan data. Periksa input Anda.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">
        {isEdit ? 'Edit Member' : 'Tambah Member'}
      </h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {loading ? (
          <div className="text-gray-500">Memuat data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                placeholder="08123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (opsional)
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poin</label>
              <input
                type="number"
                name="points"
                value={form.points}
                onChange={handleChange}
                min={0}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Admin dapat mengubah poin secara manual (misalnya koreksi).
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/admin/members')}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-60"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
