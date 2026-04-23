import { useEffect, useMemo, useState } from 'react';
import { MapPin, Mail, ArrowRight, Phone } from 'lucide-react';
import { fetchLab } from '../lib/api';
import type { LabInfo } from '../lib/types';

export default function Contact() {
  const [lab, setLab] = useState<LabInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const labInfo = await fetchLab();
        if (!mounted) return;
        setLab(labInfo);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load contact data');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const mapUrl = useMemo(() => {
    const lat = lab?.map_lat ?? 20.9988;
    const lng = lab?.map_lng ?? 105.8426;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }, [lab?.map_lat, lab?.map_lng]);

  if (loading) {
    return <div className="w-full px-4 md:px-20 py-12 max-w-[1728px] mx-auto text-gray-500">Loading contact...</div>;
  }

  if (error) {
    return <div className="w-full px-4 md:px-20 py-12 max-w-[1728px] mx-auto text-red-600">{error}</div>;
  }

  return (
    <div className="w-full px-4 md:px-20 py-12 max-w-[1728px] mx-auto">
      <div className="mb-8">
        {lab?.recruiting && (
          <span className="inline-block bg-[#fef3c7] text-[#d97706] px-4 py-1 rounded-full text-sm font-semibold mb-4">
            RECRUITING
          </span>
        )}
        <h1 className="font-['Athiti:Bold',sans-serif] text-5xl md:text-7xl mb-8">Contact us</h1>
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 mb-12">
        <p className="font-['Athiti:Regular',sans-serif] text-white text-xl md:text-2xl mb-6 max-w-3xl">
          Together, let's build impactful research. We are looking for researchers interested in AI, analytics and digital transformation.
        </p>
        <a
          href={lab?.apply_link || '#'}
          className="inline-flex bg-[#fbbf24] hover:bg-[#f59e0b] text-black px-8 py-4 rounded-full font-['Athiti:SemiBold',sans-serif] text-lg items-center gap-2 transition"
        >
          Apply now
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <MapPin className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-['Athiti:SemiBold',sans-serif] text-2xl mb-4">Address</h3>
              <p className="text-gray-700 leading-relaxed">{lab?.address}</p>
              <p className="text-gray-500 mt-2">{lab?.room}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <Mail className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-['Athiti:SemiBold',sans-serif] text-2xl mb-4">Contact</h3>
              <a href={`mailto:${lab?.email}`} className="block text-gray-700 hover:text-blue-600 transition mb-2">
                {lab?.email}
              </a>
              <a href={`tel:${lab?.phone || ''}`} className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                <Phone className="w-4 h-4" />
                <span>{lab?.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[400px] md:h-[500px] bg-gray-100 rounded-3xl overflow-hidden">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Lab Location"
        ></iframe>

        <div className="absolute bottom-6 left-6 bg-white rounded-2xl p-4 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">{lab?.name}</p>
              <p className="text-sm text-gray-600">{lab?.university}</p>
              <p className="text-sm text-gray-500 mt-1">{lab?.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
