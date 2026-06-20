import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PenTool,
  MessageSquare,
  LogOut,
  BookMarked,
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useMessageStore } from '../../store/useMessageStore';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const { currentUser, logout } = useUserStore();
  const navigate = useNavigate();
  const unreadCount = useMessageStore(state => state.getUnreadCount());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const editorLinks = [
    { to: '/dashboard', label: '作品看板', icon: LayoutDashboard },
    { to: '/messages', label: '消息中心', icon: MessageSquare, badge: unreadCount },
  ];

  const authorLinks = [
    { to: '/author/status', label: '状态填报', icon: PenTool },
    { to: '/messages', label: '消息中心', icon: MessageSquare, badge: unreadCount },
  ];

  const links = currentUser?.role === 'editor' ? editorLinks : authorLinks;

  return (
    <aside className="w-60 bg-[#1e3a5f] min-h-screen flex flex-col text-white">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <BookMarked className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ fontFamily: "'Source Han Serif SC', serif" }}>
              网文工作台
            </h1>
            <p className="text-xs text-white/60">协同创作管理</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                'hover:bg-white/10 group',
                isActive ? 'bg-white/15 text-amber-300' : 'text-white/80'
              )
            }
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{link.label}</span>
            {link.badge && link.badge > 0 && (
              <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                {link.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        {currentUser && (
          <div className="mb-4">
            <div className="flex items-center gap-3 px-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full bg-white/20"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-white/60">
                  {currentUser.role === 'editor' ? '编辑' : '作者'}
                </p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">退出登录</span>
        </button>
      </div>
    </aside>
  );
}
