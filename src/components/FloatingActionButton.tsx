import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import QuickCardAdd from './QuickCardAdd';
import { useI18n } from '../i18n';
import { 
  Plus, 
  Zap, 
  Database, 
  X,
  ChevronUp,
  BookOpen,
  Target,
  Clock
} from 'lucide-react';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const location = useLocation();
  const { t } = useI18n();

  // Don't show FAB on create page
  if (location.pathname === '/create') {
    return null;
  }

  const actions = [
    {
      icon: Zap,
      label: t('fab.quickAdd'),
      description: t('fab.quickAdd.desc'),
      color: '#fbbf24',
      onClick: () => {
        setShowQuickAdd(true);
        setIsOpen(false);
      }
    },
    {
      icon: Plus,
      label: t('fab.newCard'),
      description: t('fab.newCard.desc'),
      color: '#10b981',
      href: '/create'
    },
    {
      icon: Database,
      label: t('fab.bulkImport'),
      description: t('fab.bulkImport.desc'),
      color: '#8b5cf6',
      href: '/create?mode=import'
    },
    {
      icon: BookOpen,
      label: t('fab.quickTest'),
      description: t('fab.quickTest.desc'),
      color: '#3b82f6',
      href: '/study?mode=quick'
    }
  ];

  return (
    <>
      {/* FAB Menu */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px'
      }}>
        {/* Action Items */}
        {isOpen && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'fadeInUp 0.3s ease'
          }}>
            {actions.map((action, index) => {
              const Icon = action.icon;
              
              const ActionButton = (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    minWidth: '200px',
                    transform: 'translateY(20px)',
                    opacity: 0,
                    animation: `slideUp 0.3s ease ${index * 0.1}s forwards`
                  }}
                  onClick={action.onClick}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) translateX(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px) translateX(0px)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: action.color,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <p style={{
                      fontWeight: '600',
                      color: '#1f2937',
                      fontSize: '14px',
                      margin: '0 0 2px 0'
                    }}>
                      {action.label}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {action.description}
                    </p>
                  </div>
                </div>
              );

              if (action.href) {
                return (
                  <Link
                    key={action.label}
                    to={action.href}
                    style={{ textDecoration: 'none' }}
                    onClick={() => setIsOpen(false)}
                  >
                    {ActionButton}
                  </Link>
                );
              }

              return <div key={action.label}>{ActionButton}</div>;
            })}
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isOpen 
              ? 'linear-gradient(45deg, #ef4444, #dc2626)' 
              : 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = isOpen 
              ? '0 12px 40px rgba(239, 68, 68, 0.4)'
              : '0 12px 40px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = isOpen 
              ? '0 8px 32px rgba(239, 68, 68, 0.3)'
              : '0 8px 32px rgba(59, 130, 246, 0.3)';
          }}
        >
          {/* Ripple effect on click */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            transform: isOpen ? 'scale(1)' : 'scale(0)',
            transition: 'transform 0.3s ease'
          }}></div>
          
          {isOpen ? (
            <X style={{ 
              width: '28px', 
              height: '28px', 
              color: 'white',
              transform: 'rotate(180deg)',
              transition: 'transform 0.3s ease'
            }} />
          ) : (
            <Plus style={{ 
              width: '28px', 
              height: '28px', 
              color: 'white',
              transform: 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }} />
          )}
        </button>

        {/* Tooltip */}
        {!isOpen && (
          <div style={{
            position: 'absolute',
            right: '72px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
            animation: 'tooltipShow 2s ease 1s forwards'
          }}>
            {t('layout.fab.tooltip')}
            <div style={{
              position: 'absolute',
              right: '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid rgba(0, 0, 0, 0.8)',
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent'
            }}></div>
          </div>
        )}
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickCardAdd 
          onClose={() => setShowQuickAdd(false)}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes tooltipShow {
          0%, 90% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.5);
          }
        }
      `}</style>
    </>
  );
};

export default FloatingActionButton;