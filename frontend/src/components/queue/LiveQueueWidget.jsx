import React from 'react';
import { Users, Volume2, SkipForward, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';

export const LiveQueueWidget = ({
  queueData,
  onCallNext,
  onSkip,
  onComplete,
  isLoading,
  canManage = true,
}) => {
  const currentItem = queueData?.currentlyServing;
  const waitingItems = (queueData?.items || []).filter((i) => i.status === 'WAITING');

  return (
    <Card className="overflow-hidden border-brand-100 bg-gradient-to-b from-white to-brand-50/20">
      <CardHeader className="bg-brand-600 text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300" />
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wider">Live Reception Queue</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-brand-100 bg-brand-700/60 py-1 px-2.5 rounded-full font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Today</span>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Currently Serving Display */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded-full">
                  Currently Serving
                </span>
                <div className="text-4xl font-extrabold text-slate-900 mt-2 font-mono">
                  {queueData?.currentlyServingToken || 'None'}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                <Volume2 className="w-6 h-6" />
              </div>
            </div>

            {currentItem ? (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-800">{currentItem.patientName}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{currentItem.serviceName}</span>
                  <span>•</span>
                  <span>{currentItem.doctorName}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-3">No patient currently inside consultation room.</p>
            )}

            {canManage && (
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={onCallNext}
                  loading={isLoading}
                  size="sm"
                  variant="primary"
                  icon={Volume2}
                  className="flex-1"
                >
                  Call Next Patient
                </Button>
                {currentItem && (
                  <Button
                    onClick={() => onComplete(currentItem._id)}
                    size="sm"
                    variant="success"
                    icon={CheckCircle2}
                  >
                    Done
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Queue Statistics Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Waiting in Clinic
              </span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {queueData?.totalWaiting || 0}{' '}
                <span className="text-xs font-normal text-slate-500">patients</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Completed today:</span>
                <span className="font-bold text-emerald-600">{queueData?.totalServedToday || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated wait:</span>
                <span className="font-bold text-slate-900">
                  {waitingItems.length > 0 ? `${waitingItems.length * 15} mins` : '0 mins'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Up Next Patient List */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Next in Queue ({waitingItems.length})
          </h4>
          {waitingItems.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
              Queue is clear. No patients currently waiting.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {waitingItems.map((item, idx) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                      {item.tokenNumber}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{item.patientName}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.serviceName} • with {item.doctorName}
                      </p>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSkip(item._id)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                        title="Skip patient"
                      >
                        <SkipForward className="w-3 h-3" />
                        <span>Skip</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
