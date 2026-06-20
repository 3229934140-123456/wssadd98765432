import { useState } from 'react';
import {
  Bell,
  Lightbulb,
  Calendar,
  Send,
  Check,
  Loader2,
} from 'lucide-react';
import type { MessageTemplate, MessageTemplateType } from '../types/message';
import { cn } from '../lib/utils';

interface MessageTemplateCardProps {
  template: MessageTemplate;
  workTitle: string;
  draftCount: number;
  onSend: (type: MessageTemplateType) => void;
}

const iconMap: Record<string, typeof Bell> = {
  Bell,
  Lightbulb,
  Calendar,
};

const typeConfig: Record<MessageTemplateType, {
  borderColor: string;
  hoverBg: string;
  activeBg: string;
  buttonColor: string;
}> = {
  reminder: {
    borderColor: 'border-blue-200',
    hoverBg: 'hover:border-blue-400',
    activeBg: 'bg-blue-50 border-blue-400',
    buttonColor: 'bg-blue-500 hover:bg-blue-600',
  },
  suggestion: {
    borderColor: 'border-amber-200',
    hoverBg: 'hover:border-amber-400',
    activeBg: 'bg-amber-50 border-amber-400',
    buttonColor: 'bg-amber-500 hover:bg-amber-600',
  },
  appointment: {
    borderColor: 'border-purple-200',
    hoverBg: 'hover:border-purple-400',
    activeBg: 'bg-purple-50 border-purple-400',
    buttonColor: 'bg-purple-500 hover:bg-purple-600',
  },
};

export function MessageTemplateCard({
  template,
  workTitle,
  draftCount,
  onSend,
}: MessageTemplateCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(
    template.template
      .replace('{workTitle}', workTitle)
      .replace('{draftCount}', String(draftCount))
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const Icon = iconMap[template.icon] || Bell;
  const config = typeConfig[template.type];

  const handleSend = async () => {
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onSend(template.type);
    setSending(false);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setIsEditing(false);
    }, 2000);
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 transition-all duration-300',
        'bg-white overflow-hidden',
        isEditing ? config.activeBg : cn('border-stone-200', config.hoverBg)
      )}
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              config.buttonColor,
              'text-white shadow-lg'
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-stone-800">{template.title}</h4>
            <p className="text-sm text-stone-500 mt-1">{template.description}</p>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-32 px-4 py-3 rounded-xl border border-stone-300 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 outline-none resize-none text-sm bg-white"
              placeholder="编辑消息内容..."
            />
            <div className="flex gap-3">
              <button
                onClick={handleSend}
                disabled={sending || sent}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-all',
                  config.buttonColor,
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    发送中...
                  </>
                ) : sent ? (
                  <>
                    <Check className="w-4 h-4" />
                    已发送
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    发送消息
                  </>
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-stone-50 rounded-xl p-4 mb-4 border border-stone-200">
              <p className="text-sm text-stone-600 leading-relaxed">
                "{content}"
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className={cn(
                'w-full py-3 rounded-xl font-medium transition-all',
                'bg-white border-2 border-stone-200 text-stone-700',
                'hover:border-[#1e3a5f] hover:text-[#1e3a5f]'
              )}
            >
              编辑并发送
            </button>
          </>
        )}
      </div>
    </div>
  );
}
