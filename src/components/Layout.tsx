import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FloatingActionButton from './FloatingActionButton';
import { useThemeStore } from '../store/themeStore';
import { applyTheme } from '../utils/themeUtils';
import { useI18n } from '../i18n';

import { 
  Home, 
  Plus, 
  BookOpen, 
  BarChart3, 
  Settings as SettingsIcon,
  Brain,
  User,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Zap,
  Trophy,
  Target,
  Sun,
  Moon,
  Monitor,
  Palette
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications] = useState(3);
  const { mode, colorScheme, fontSize, setThemeMode, language, setLanguage } = useThemeStore();
  const { t } = useI18n();
  
  const toggleTheme = () => {
    const modes = ['light', 'dark', 'auto'] as const;
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];
    console.log('🔄 Theme toggle:', mode, '->', newMode);
    
    // Set theme mode and apply immediately
    setThemeMode(newMode);
    
    // Also apply manually to ensure immediate effect
    setTimeout(() => {
      applyTheme({ mode: newMode, colorScheme, fontSize });
    }, 10);
  };

  const getThemeIcon = () => {
    switch (mode) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'auto': return Monitor;
      default: return Sun;
    }
  };

  const navText = {
    dashboard: { name: t('nav.dashboard'), desc: t('nav.dashboard.desc') },
    create: { name: t('nav.create'), desc: t('nav.create.desc') },
    study: { name: t('nav.study'), desc: t('nav.study.desc') },
    stats: { name: t('nav.stats'), desc: t('nav.stats.desc') },
    settings: { name: t('nav.settings'), desc: t('nav.settings.desc') },
    search: t('common.search')
  } as const;

  const navigation = [
    { name: navText.dashboard.name, href: '/', icon: Home, badge: null, description: navText.dashboard.desc },
    { name: navText.create.name, href: '/create', icon: Plus, badge: null, description: navText.create.desc },
    { name: navText.study.name, href: '/study', icon: BookOpen, badge: '12', description: navText.study.desc },
    { name: navText.stats.name, href: '/statistics', icon: BarChart3, badge: null, description: navText.stats.desc },
    { name: navText.settings.name, href: '/settings', icon: SettingsIcon, badge: null, description: navText.settings.desc },
  ];

  const quickStats = [
    { label: t('layout.quick.today'), value: '8/10', icon: Target, color: 'text-blue-500' },
    { label: t('layout.quick.streak'), value: `7 ${t('common.days')}`, icon: Zap, color: 'text-orange-500' },
    { label: t('layout.quick.accuracy'), value: '%89', icon: Trophy, color: 'text-green-500' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{
        width: isCollapsed ? '80px' : '320px',
        height: '100vh',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {!isCollapsed && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Brain style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <div>
                  <h1 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: 0
                  }}>TestDeck</h1>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    margin: 0
                  }}>Pro v2.0</div>
                </div>
              </div>
            )}
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {!isCollapsed && (
                <button
                  onClick={toggleTheme}
                  style={{
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                  title={mode === 'light' ? t('theme.title.light') : mode === 'dark' ? t('theme.title.dark') : t('theme.title.auto')}
                >
                  {(() => {
                    const ThemeIcon = getThemeIcon();
                    return <ThemeIcon size={16} />;
                  })()}
                </button>
              )}

              {!isCollapsed && (
                <button
                  onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
                  style={{
                    padding: '8px 10px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'all 0.2s ease',
                    fontWeight: 700,
                  }}
                  title={language === 'tr' ? 'Switch to English' : "Türkçe'ye geç"}
                >
                  {language === 'tr' ? 'EN' : 'TR'}
                </button>
              )}
              
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                {isCollapsed ? <Menu size={20} /> : <X size={20} />}
              </button>
            </div>
          </div>

          {/* Search */}
          {!isCollapsed && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: 'rgba(255, 255, 255, 0.6)'
                }} />
                <input
                  type="text"
                  placeholder={navText.search}
                  style={{
                    width: '100%',
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {!isCollapsed && (
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.label}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '12px',
                      textAlign: 'center'
                    }}
                  >
                    <Icon style={{ width: '16px', height: '16px', margin: '0 auto 4px', color: stat.color === 'text-blue-500' ? '#3b82f6' : stat.color === 'text-orange-500' ? '#f97316' : '#10b981' }} />
                    <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', margin: '0' }}>{stat.label}</p>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', margin: '0' }}>{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  background: isActive 
                    ? 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))' 
                    : 'transparent',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: isActive 
                    ? 'linear-gradient(45deg, #3b82f6, #8b5cf6)' 
                    : 'rgba(255, 255, 255, 0.2)',
                  marginRight: isCollapsed ? '0' : '12px'
                }}>
                  <Icon style={{
                    width: '20px',
                    height: '20px',
                    color: 'white'
                  }} />
                </div>
                
                {!isCollapsed && (
                  <>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontWeight: '600',
                        color: isActive ? '#3b82f6' : 'white',
                        margin: '0 0 2px 0',
                        fontSize: '14px'
                      }}>
                        {item.name}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        margin: 0
                      }}>
                        {item.description}
                      </p>
                    </div>
                    
                    {item.badge && (
                      <div style={{
                        background: '#3b82f6',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {item.badge}
                      </div>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {!isCollapsed ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    position: 'relative',
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(45deg, #10b981, #14b8a6)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User style={{ width: '20px', height: '20px', color: 'white' }} />
                    {notifications > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '20px',
                        height: '20px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {notifications}
                      </div>
                    )}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', color: 'white', fontSize: '14px', margin: '0' }}>{t('common.user')}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '0' }}>{t('common.premiumMember')}</p>
                  </div>
                </div>
                <ChevronDown style={{ width: '16px', height: '16px', color: 'rgba(255, 255, 255, 0.6)' }} />
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                background: 'linear-gradient(45deg, #10b981, #14b8a6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User style={{ width: '20px', height: '20px', color: 'white' }} />
                {notifications > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '16px',
                    height: '16px',
                    background: '#ef4444',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {notifications}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: isCollapsed ? '80px' : '320px',
        flex: 1,
        transition: 'margin-left 0.3s ease'
      }}>
        <main style={{ minHeight: '100vh' }}>
          {children}
        </main>
        
        {/* Floating Action Button */}
        <FloatingActionButton />
        

      </div>
    </div>
  );
};

export default Layout;