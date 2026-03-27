/**
 * ნახევრადფაბრიკატის ვიზუალური ნიშანი — ხის კასრი (საწყობო/ნაწილობრივი პროდუქტი)
 */
export default function BulkFabLogo({
  size = 40,
  dimmed = false,
  style,
  ...rest
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        flexShrink: 0,
        opacity: dimmed ? 0.55 : 1,
        display: 'block',
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <linearGradient id="bulkWood" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a0703a" />
          <stop offset="35%" stopColor="#c99552" />
          <stop offset="65%" stopColor="#b88245" />
          <stop offset="100%" stopColor="#8b5a28" />
        </linearGradient>
        <linearGradient id="bulkHoop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a7adb" />
          <stop offset="50%" stopColor="#2d6fe0" />
          <stop offset="100%" stopColor="#1e4a9e" />
        </linearGradient>
        <linearGradient id="bulkLid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8c88a" />
          <stop offset="100%" stopColor="#c49a52" />
        </linearGradient>
      </defs>

      {/* ზედა სახურავი */}
      <ellipse cx="24" cy="11" rx="13" ry="4.5" fill="url(#bulkLid)" stroke="#7a5220" strokeWidth="0.6" />

      {/* კორპუსი — გვერდითი ხედი, შუაში გაბერილი */}
      <path
        d="M11 12.5
           C11 12.5 9.5 18 9.5 24
           C9.5 30 11 35.5 11 35.5
           C11 37.5 16 40 24 40
           C32 40 37 37.5 37 35.5
           C37 35.5 38.5 30 38.5 24
           C38.5 18 37 12.5 37 12.5
           C37 11 32 9 24 9
           C16 9 11 11 11 12.5 Z"
        fill="url(#bulkWood)"
        stroke="#5c3d1e"
        strokeWidth="0.8"
      />

      {/* ხის ბრტყელი ხაზები */}
      <path d="M14 16 Q24 18 34 16" stroke="#6b4423" strokeWidth="0.4" fill="none" opacity="0.5" />
      <path d="M13.5 22 Q24 24.5 34.5 22" stroke="#6b4423" strokeWidth="0.4" fill="none" opacity="0.45" />
      <path d="M13.5 28 Q24 30.5 34.5 28" stroke="#6b4423" strokeWidth="0.4" fill="none" opacity="0.4" />

      {/* მეტალის რგოლები */}
      <path
        d="M10.5 17.5 Q24 20.5 37.5 17.5"
        stroke="url(#bulkHoop)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M9.8 24 Q24 27.2 38.2 24"
        stroke="url(#bulkHoop)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10.5 30.5 Q24 33.5 37.5 30.5"
        stroke="url(#bulkHoop)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* ქვედა ელიფსი */}
      <ellipse cx="24" cy="37.5" rx="12" ry="3.8" fill="#7a4a22" opacity="0.85" />

      {/* მცირე „რძის ორთქლი“ — სამზარეულოს ასოციაცია */}
      <path
        d="M20 6 Q20 3 22.5 2.5 M24 5.5 Q24 2 26 1.5 M28 6 Q28 3.5 30 3"
        stroke="#b0a090"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}
