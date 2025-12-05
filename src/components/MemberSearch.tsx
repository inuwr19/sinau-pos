import { useState } from 'react';
import { Search, X, UserPlus, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Member } from '../types';

interface MemberSearchProps {
  selectedMember: Member | null;
  onSelectMember: (member: Member | null) => void;
}

export default function MemberSearch({
  selectedMember,
  onSelectMember,
}: MemberSearchProps) {
  const [phone, setPhone] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', email: '' });
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchMember = async () => {
    if (!phone.trim()) return;

    setSearching(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (data && !error) {
      onSelectMember(data);
      setPhone('');
    } else {
      setNewMember({ ...newMember, phone });
      setShowForm(true);
    }
    setSearching(false);
  };

  const handleCreateMember = async () => {
    if (!newMember.name || !newMember.phone) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .insert([newMember])
      .select()
      .single();

    if (data && !error) {
      onSelectMember(data);
      setShowForm(false);
      setNewMember({ name: '', phone: '', email: '' });
      setPhone('');
    }
    setLoading(false);
  };

  if (selectedMember) {
    return (
      <div className="space-y-3">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {selectedMember.name}
                </p>
                <p className="text-xs text-gray-600">{selectedMember.phone}</p>
              </div>
            </div>
            <button
              onClick={() => onSelectMember(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white rounded px-2 py-1 inline-block">
            <span className="text-xs font-medium text-amber-600">
              {selectedMember.points} Poin
            </span>
          </div>
        </div>
        <p className="text-xs text-green-600 font-medium">
          Diskon 10% untuk member!
        </p>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-3">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-medium text-gray-800">
              Member Baru
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
            <input
              type="tel"
              placeholder="Nomor Telepon"
              value={newMember.phone}
              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
            <input
              type="email"
              placeholder="Email (opsional)"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => {
                setShowForm(false);
                setPhone('');
                setNewMember({ name: '', phone: '', email: '' });
              }}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleCreateMember}
              disabled={loading || !newMember.name || !newMember.phone}
              className="flex-1 px-3 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <input
          type="tel"
          placeholder="Nomor Telepon Member"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchMember()}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
        />
        <button
          onClick={searchMember}
          disabled={searching || !phone.trim()}
          className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Cari dengan nomor telepon atau daftar member baru
      </p>
    </div>
  );
}
