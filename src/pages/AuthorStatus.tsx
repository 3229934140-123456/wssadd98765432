import { useWorkStore } from '../store/useWorkStore';
import { useUserStore } from '../store/useUserStore';
import { StatusForm } from '../components/StatusForm';
import { Timeline } from '../components/Timeline';
import { WordChart } from '../components/WordChart';
import type { UpdateStatus } from '../types/work';

export function AuthorStatus() {
  const { currentUser } = useUserStore();
  const { works, getDailyStatuses, submitDailyStatus } = useWorkStore();

  const authorWorks = works.filter(w => w.authorId === currentUser?.id);
  const currentWork = authorWorks[0];
  const statuses = currentWork ? getDailyStatuses(currentWork.id) : [];

  const handleSubmit = (data: {
    wordCount: number;
    draftCount: number;
    updateStatus: UpdateStatus;
    onLeave: boolean;
    leaveReason?: string;
  }) => {
    if (currentWork) {
      submitDailyStatus(currentWork.id, data);
    }
  };

  if (!currentUser || currentUser.role !== 'author') {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500">请以作者身份登录</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-bold text-stone-800"
          style={{ fontFamily: "'Source Han Serif SC', serif" }}
        >
          状态填报
        </h1>
        <p className="text-stone-500 mt-2">每日更新状态上报，让编辑及时了解创作进度</p>
      </div>

      {currentWork ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <StatusForm workTitle={currentWork.title} onSubmit={handleSubmit} />
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                <h3 className="text-lg font-bold text-stone-800 mb-4">我的作品</h3>
                <div className="space-y-3">
                  {authorWorks.map((work) => (
                    <div
                      key={work.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 border border-stone-100"
                    >
                      <div
                        className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center flex-shrink-0"
                      >
                        <span
                          className="text-white/80 text-xl font-bold"
                          style={{ fontFamily: "'Source Han Serif SC', serif" }}
                        >
                          {work.title.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-800 truncate">{work.title}</p>
                        <p className="text-sm text-stone-500">{work.category} · {(work.totalWords / 10000).toFixed(1)} 万字</p>
                      </div>
                      <span className="text-sm text-stone-400">连载中</span>
                    </div>
                  ))}
                </div>
              </div>

              {statuses.length > 0 && (
                <>
                  <WordChart statuses={statuses} />
                  <Timeline statuses={statuses} />
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-12 text-center">
          <p className="text-stone-500">暂无签约作品</p>
        </div>
      )}
    </div>
  );
}
