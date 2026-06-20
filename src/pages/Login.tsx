import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookMarked,
  User,
  PenTool,
  BookOpen,
} from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { authors, editors } from '../utils/mockData';
import type { UserRole } from '../types/user';
import { cn } from '../lib/utils';

export function Login() {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>('editor');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleLogin = () => {
    login(selectedRole, selectedUserId || undefined);
    if (selectedRole === 'editor') {
      navigate('/dashboard');
    } else {
      navigate('/author/status');
    }
  };

  const roleOptions = [
    {
      value: 'editor' as UserRole,
      label: '我是编辑',
      description: '管理作品风险，发送催更消息',
      icon: BookOpen,
      users: editors,
    },
    {
      value: 'author' as UserRole,
      label: '我是作者',
      description: '上报更新状态，查看编辑消息',
      icon: PenTool,
      users: authors,
    },
  ];

  const currentRole = roleOptions.find(r => r.value === selectedRole);
  const users = currentRole?.users || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#1e3a5f] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-6 shadow-xl shadow-amber-500/20">
            <BookMarked className="w-10 h-10 text-white" />
          </div>
          <h1
            className="text-4xl font-bold text-white mb-3"
            style={{ fontFamily: "'Source Han Serif SC', serif" }}
          >
            网文工作台
          </h1>
          <p className="text-white/60 text-lg">协同创作管理平台</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">
                选择身份
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  const isActive = selectedRole === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.value);
                        setSelectedUserId('');
                      }}
                      className={cn(
                        'relative p-4 rounded-xl border-2 transition-all text-left',
                        isActive
                          ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                          : 'border-stone-200 hover:border-stone-300'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-6 h-6 mb-2',
                          isActive ? 'text-[#1e3a5f]' : 'text-stone-400'
                        )}
                      />
                      <p
                        className={cn(
                          'font-bold',
                          isActive ? 'text-[#1e3a5f]' : 'text-stone-700'
                        )}
                      >
                        {role.label}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {role.description}
                      </p>
                      {isActive && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">
                选择账号 (演示用)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {users.map((user) => {
                  const isActive = selectedUserId === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                        isActive
                          ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                          : 'border-stone-200 hover:border-stone-300'
                      )}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full bg-stone-100"
                      />
                      <div className="flex-1 text-left">
                        <p
                          className={cn(
                            'font-medium',
                            isActive ? 'text-[#1e3a5f]' : 'text-stone-700'
                          )}
                        >
                          {user.name}
                        </p>
                        <p className="text-xs text-stone-500">
                          {user.role === 'editor' ? '编辑' : '作者'}
                        </p>
                      </div>
                      {isActive && (
                        <div className="w-5 h-5 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] hover:from-[#2d4a6f] hover:to-[#1e3a5f] shadow-lg shadow-[#1e3a5f]/20 hover:shadow-[#1e3a5f]/30 active:scale-[0.98]"
            >
              进入工作台
            </button>
          </div>
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          演示版本 · 用于功能展示
        </p>
      </div>
    </div>
  );
}
