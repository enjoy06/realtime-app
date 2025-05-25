//HALAMAN REDIREK LINK
'use client';

import { uuid2bin } from '@/lib/bin2hex';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Link() {
  const router = useRouter();
  const pathname = usePathname();
  const [statusText, setStatusText] = useState('Loading...');

  useEffect(() => {
    if (!pathname) return;

    const segment = pathname.split('/')[1];

    if (!segment) {
      setStatusText('Invalid link format.');
      return;
    }

    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(segment); // rudimentary base64 check
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(segment); // rudimentary uuid check

    let targetId = '';

    try {
      if (isUUID) {
        // binary encoded as uuid
        targetId = uuid2bin(segment);
        setStatusText('Redirecting you to the destination link...');
      } else if (isBase64) {
        const decoded = atob(segment);
        targetId = new TextDecoder().decode(Uint8Array.from(decoded, c => c.charCodeAt(0)));
        setStatusText('Redirecting you to the destination link...');
      } else {
        setStatusText('Unknown format.');
        return;
      }
    } catch (err) {
      console.error(err);
      setStatusText('Error decoding link.');
      return;
    }

    // Simulate loading + redirect
    const timeout = setTimeout(async () => {
      const create_clicks = await axios.get(`/api/click?sub=${targetId.split('|')[2]}`);
      if (create_clicks.status !== 200) {
        setStatusText('Failed to create click record.');
        return;
      }
      router.push(`https://chgbgba.getofrhub.com/s/275123d529ecb?track=${targetId.split('|')[2]}&ext_click_id=${create_clicks.data.data}`);
      setStatusText('Redirecting to destination...');
    }, 1500); // 3 detik delay

    return () => clearTimeout(timeout); // cleanup
  }, [pathname, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <div className="mb-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto"></div>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{statusText}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Redirecting to destination shortly...</p>
      </div>
    </div>
  );
}