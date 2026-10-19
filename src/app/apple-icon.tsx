import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#0C1B3A" />
          <rect x="3.5" y="8" width="16" height="19" rx="3" fill="#3E5EAE" />
          <rect x="9" y="4.5" width="19.5" height="23" rx="3.5" fill="#F4F6FB" />
          <circle cx="18.75" cy="11" r="3.4" fill="#2F6BFF" />
          <circle cx="18.75" cy="10.1" r="1.05" fill="#FFFFFF" />
          <path d="M16.3 13.15c.45-1.15 1.25-1.75 2.45-1.75s2 .6 2.45 1.75" fill="#FFFFFF" />
          <circle cx="12.3" cy="17.3" r="1.15" fill="#34C759" />
          <rect x="14.4" y="16.75" width="10.5" height="1.15" rx="0.6" fill="#C9D0DE" />
          <circle cx="12.3" cy="20.5" r="1.15" fill="#FF9F0A" />
          <rect x="14.4" y="19.95" width="8" height="1.15" rx="0.6" fill="#C9D0DE" />
          <circle cx="12.3" cy="23.7" r="1.15" fill="#3B82F6" />
          <rect x="14.4" y="23.15" width="6" height="1.15" rx="0.6" fill="#C9D0DE" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
