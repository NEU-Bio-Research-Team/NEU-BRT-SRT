import { useEffect, useMemo, useState } from 'react';
import { Mail, FileText } from 'lucide-react';
import { fetchMembers, normalizeMemberPhoto } from '../lib/api';
import type { MemberItem } from '../lib/types';

type TeamFilter = 'bio' | 'finance';
type RoleFilter = 'all' | 'mentor' | 'member';

export default function Members() {
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('bio');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMembers({ team: teamFilter, role: roleFilter, q: searchTerm });
        if (!mounted) return;
        setItems(data.items);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load members');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [teamFilter, roleFilter, searchTerm]);

  const mentors = useMemo(() => items.filter((item) => item.role_key === 'mentor'), [items]);
  const members = useMemo(() => items.filter((item) => item.role_key === 'member'), [items]);

  const MemberCard = ({ member }: { member: MemberItem }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
      <div className="flex gap-6">
        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          <img
            src={normalizeMemberPhoto(member.photo)}
            alt={member.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-grow">
          <h3 className="font-['Athiti:SemiBold',sans-serif] text-2xl mb-2">{member.name}</h3>
          <p className="text-[#d97706] text-sm font-semibold mb-2 uppercase tracking-wide">{member.role}</p>

          {member.department && (
            <p className="text-sm text-gray-500 mb-1">{member.department}</p>
          )}

          {member.research_scope && (
            <div className="flex items-start gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-500 mt-1" />
              <p className="text-sm text-gray-600">{member.research_scope}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <a href={`mailto:${member.email}`} className="text-sm text-gray-600 hover:text-blue-600">
              {member.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = (title: string, data: MemberItem[]) => (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-1 h-8 bg-[#d97706]"></div>
        <h2 className="font-['Athiti:SemiBold',sans-serif] text-3xl">{title}</h2>
        <span className="bg-gray-100 px-4 py-1 rounded-full text-sm text-gray-600">
          {data.length} member{data.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );

  return (
    <div className="w-full px-4 md:px-20 py-12 max-w-[1728px] mx-auto">
      <h1 className="font-['Athiti:Bold',sans-serif] text-5xl md:text-7xl mb-12">Members</h1>

      <div className="flex flex-col gap-6 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-3">
            <button
              onClick={() => setTeamFilter('bio')}
              className={`px-8 py-3 rounded-full font-['Athiti:Regular',sans-serif] text-lg transition ${
                teamFilter === 'bio'
                  ? 'bg-white border-2 border-black text-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Bio
            </button>
            <button
              onClick={() => setTeamFilter('finance')}
              className={`px-8 py-3 rounded-full font-['Athiti:Regular',sans-serif] text-lg transition ${
                teamFilter === 'finance'
                  ? 'bg-white border-2 border-black text-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Finance
            </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="text-gray-500 text-sm">FILTER</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Members</option>
              <option value="mentor">Mentors</option>
              <option value="member">Members</option>
            </select>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search members by name, faculty or research scope..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full md:max-w-xl px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && <div className="text-gray-500">Loading members...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-20">
          <p className="font-['Athiti:Regular',sans-serif] text-2xl text-gray-400">No members found.</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-12">
          {mentors.length > 0 && renderSection('Mentors', mentors)}
          {members.length > 0 && renderSection('Members', members)}
        </div>
      )}
    </div>
  );
}
