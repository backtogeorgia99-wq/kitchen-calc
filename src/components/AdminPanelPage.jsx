import { useState } from 'react'
import CategoriesPage from './CategoriesPage'
import UsersAdminPage from './UsersAdminPage'
import BusinessSettingsPage from './BusinessSettingsPage'
import AuditLogPage from './AuditLogPage'
import BackupPage from './BackupPage'
import BulkFabLogo from './BulkFabLogo'

export default function AdminPanelPage({ user, theme }) {
  const isDark = theme === 'dark'
  /** @type {'menu' | 'bulk' | 'portion' | 'users' | 'business' | 'audit' | 'backup'} */
  const [section, setSection] = useState('menu')

  const btnBase = {
    width: '100%',
    padding: '16px 18px',
    borderRadius: 16,
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Noto Sans Georgian', sans-serif",
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    transition: 'transform 0.15s, box-shadow 0.15s',
  }

  if (section === 'users') {
    return (
      <div style={{ padding: '16px 16px 48px', animation: 'fadeUp 0.3s ease' }}>
        <UsersAdminPage
          user={user}
          theme={theme}
          onBack={() => setSection('menu')}
        />
      </div>
    )
  }

  if (section === 'business') {
    return (
      <div style={{ animation: 'fadeUp 0.3s ease' }}>
        <BusinessSettingsPage theme={theme} onBack={() => setSection('menu')} />
      </div>
    )
  }

  if (section === 'audit') {
    return (
      <div style={{ animation: 'fadeUp 0.3s ease' }}>
        <AuditLogPage theme={theme} onBack={() => setSection('menu')} />
      </div>
    )
  }

  if (section === 'backup') {
    return (
      <div style={{ animation: 'fadeUp 0.3s ease' }}>
        <BackupPage user={user} theme={theme} onBack={() => setSection('menu')} />
      </div>
    )
  }

  if (section === 'bulk' || section === 'portion') {
    return (
      <div style={{ padding: '16px 16px 48px', animation: 'fadeUp 0.3s ease' }}>
        <button
          type="button"
          onClick={() => setSection('menu')}
          style={{
            marginBottom: 16,
            padding: '8px 0',
            background: 'none',
            border: 'none',
            color: isDark ? '#9e9080' : '#7a6a55',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Noto Sans Georgian', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← ადმინ პანელი
        </button>
        <CategoriesPage
          user={user}
          theme={theme}
          view={section === 'bulk' ? 'bulk' : 'portion'}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 16px 48px', animation: 'fadeUp 0.3s ease' }}>
      <div style={{
        marginBottom: 20,
        padding: '16px 18px',
        borderRadius: 16,
        background: isDark
          ? 'linear-gradient(135deg, rgba(232,150,15,0.12) 0%, rgba(232,150,15,0.04) 100%)'
          : 'linear-gradient(135deg, rgba(232,150,15,0.15) 0%, rgba(232,150,15,0.05) 100%)',
        border: `1px solid ${isDark ? 'rgba(232,150,15,0.25)' : 'rgba(232,150,15,0.35)'}`,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 800,
          color: '#e8960f',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          ადმინისტრატორი
        </div>
        <div style={{
          fontSize: 18, fontWeight: 800,
          color: isDark ? '#f2ede6' : '#1a1410',
          letterSpacing: '-0.02em',
          marginBottom: 4,
        }}>
          ადმინ პანელი
        </div>
        <div style={{
          fontSize: 12, color: isDark ? '#9e9080' : '#7a6a55',
        }}>
          {user?.email}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          type="button"
          onClick={() => setSection('bulk')}
          style={{
            ...btnBase,
            background: isDark ? '#1e3a5c' : '#e8f0fc',
            border: `1.5px solid ${isDark ? 'rgba(45,111,224,0.35)' : 'rgba(45,111,224,0.25)'}`,
            boxShadow: isDark
              ? '0 4px 16px rgba(0,0,0,0.25)'
              : '0 4px 16px rgba(45,111,224,0.12)',
          }}
        >
          <BulkFabLogo size={34} />
          <span style={{
            fontSize: 15, fontWeight: 800,
            color: isDark ? '#e8f0ff' : '#1a3a6e',
            letterSpacing: '-0.02em',
          }}>
            ნახევრადფაბრიკატის კატეგორიები
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSection('portion')}
          style={{
            ...btnBase,
            background: isDark ? '#143d2e' : '#e8f7ef',
            border: `1.5px solid ${isDark ? 'rgba(45,158,95,0.35)' : 'rgba(45,158,95,0.25)'}`,
            boxShadow: isDark
              ? '0 4px 16px rgba(0,0,0,0.25)'
              : '0 4px 16px rgba(45,158,95,0.12)',
          }}
        >
          <span style={{ fontSize: 28 }}>🍽️</span>
          <span style={{
            fontSize: 15, fontWeight: 800,
            color: isDark ? '#dff5ea' : '#145232',
            letterSpacing: '-0.02em',
          }}>
            1 ულუფის კატეგორიები
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSection('users')}
          style={{
            ...btnBase,
            background: isDark ? '#3d2814' : '#faf4ed',
            border: `1.5px solid ${isDark ? 'rgba(196,92,42,0.4)' : 'rgba(196,92,42,0.28)'}`,
            boxShadow: isDark
              ? '0 4px 16px rgba(0,0,0,0.25)'
              : '0 4px 16px rgba(196,92,42,0.1)',
          }}
        >
          <span style={{ fontSize: 28 }}>👥</span>
          <span style={{
            fontSize: 15, fontWeight: 800,
            color: isDark ? '#f2e6d8' : '#5c3018',
            letterSpacing: '-0.02em',
          }}>
            მომხმარებელთა ბაზა
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSection('business')}
          style={{
            ...btnBase,
            background: isDark ? '#2a2520' : '#f5f0e8',
            border: `1.5px solid ${isDark ? 'rgba(232,150,15,0.35)' : 'rgba(180,140,80,0.35)'}`,
          }}
        >
          <span style={{ fontSize: 28 }}>💰</span>
          <span style={{
            fontSize: 15, fontWeight: 800,
            color: isDark ? '#f0e8dc' : '#4a3820',
            letterSpacing: '-0.02em',
          }}>
            ფასები / დღგ / მარჟა
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSection('audit')}
          style={{
            ...btnBase,
            background: isDark ? '#1a1a28' : '#ececf8',
            border: `1.5px solid ${isDark ? 'rgba(120,100,200,0.35)' : 'rgba(100,80,180,0.25)'}`,
          }}
        >
          <span style={{ fontSize: 28 }}>📜</span>
          <span style={{
            fontSize: 15, fontWeight: 800,
            color: isDark ? '#dcd8f0' : '#2d2560',
            letterSpacing: '-0.02em',
          }}>
            აუდიტის ჟურნალი
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSection('backup')}
          style={{
            ...btnBase,
            background: isDark ? '#142820' : '#e8f5ef',
            border: `1.5px solid ${isDark ? 'rgba(45,158,95,0.4)' : 'rgba(45,158,95,0.3)'}`,
          }}
        >
          <span style={{ fontSize: 28 }}>💾</span>
          <span style={{
            fontSize: 15, fontWeight: 800,
            color: isDark ? '#d8f0e4' : '#145232',
            letterSpacing: '-0.02em',
          }}>
            მონაცემების რეზერვი
          </span>
        </button>
      </div>
    </div>
  )
}
