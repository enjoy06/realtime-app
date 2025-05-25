'use client';

interface Click {
  id: string;
  user: string;
  country: string;
  source: string;
  ip: string;
  created_at: Date;
}

interface LiveClick {
  clicks: Click[];
}

export default function LiveClick(props: LiveClick) {
    
    return (
        <></>
    );
}