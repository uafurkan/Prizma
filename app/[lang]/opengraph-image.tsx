import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const title = 'PRIZMA';
  const subtitle = 'Convert your files instantly and securely in your browser';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0b12',
          gap: 28,
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '55px solid transparent',
            borderRight: '55px solid transparent',
            borderBottom: '95px solid #06d6a0',
          }}
        />
        <div
          style={{
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: -2,
            backgroundImage: 'linear-gradient(90deg, #ff4d6d, #ff8c42, #ffd166, #06d6a0, #4d9fff, #b56cff)',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'flex',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 32, color: '#9a9aab', display: 'flex' }}>{subtitle}</div>
      </div>
    ),
    { ...size }
  );
}
