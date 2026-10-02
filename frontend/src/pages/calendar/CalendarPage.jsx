import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Ban,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

export const CalendarPage = () => {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState('week'); // 'day' | 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [selectedServiceId, setSelectedServiceId] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Slot click modal: Create Appointment or Block Slot
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const [selectedSlotDate, setSelectedSlotDate] = useState('');
  const [blockReason, setBlockReason] = useState('Maintenance / Personal Time');

  const fetchMeta = async () => {
    try {
      const [docsRes, srvsRes] = await Promise.all([api.getDoctors(), api.getServices()]);
      setDoctors(docsRes.data || []);
      setServices(srvsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      // Fetch 30-day window around currentDate
      const start = new Date(currentDate);
      start.setDate(start.getDate() - 15);
      const end = new Date(currentDate);
      end.setDate(end.getDate() + 15);

      const startStr = start.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);

      let aptQuery = `?startDate=${startStr}&endDate=${endStr}&`;
      if (selectedDoctorId !== 'all') aptQuery += `doctorId=${selectedDoctorId}&`;
      if (selectedServiceId !== 'all') aptQuery += `serviceId=${selectedServiceId}&`;

      const [aptsRes, blkRes] = await Promise.all([
        api.getAppointments(aptQuery),
        api.getBlockedSlots(),
      ]);

      setAppointments(aptsRes.data || []);
      setBlockedSlots(blkRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate, selectedDoctorId, selectedServiceId, viewMode]);

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'day') next.setDate(next.getDate() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'day') next.setDate(next.getDate() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleBlockSlotSubmit = async () => {
    try {
      const [h, m] = selectedSlotTime.split(':').map(Number);
      const endMinutes = h * 60 + m + 30;
      const endH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
      const endM = String(endMinutes % 60).padStart(2, '0');
      const endTime = `${endH}:${endM}`;

      await api.createBlockedSlot({
        doctorId: selectedDoctorId !== 'all' ? selectedDoctorId : null,
        date: selectedSlotDate,
        startTime: selectedSlotTime,
        endTime,
        reason: blockReason,
      });

      showToast(`Slot ${selectedSlotTime} on ${selectedSlotDate} blocked`, 'success');
      setSlotModalOpen(false);
      fetchCalendarEvents();
    } catch (err) {
      showToast(err.message || 'Failed to block slot', 'error');
    }
  };

  // Generate Week Days (Sun - Sat) around currentDate
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay(); // 0 is Sunday
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Calendar</h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual schedule with real-time slot blocking and multi-doctor views.
          </p>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
          {['day', 'week', 'month'].map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                viewMode === v ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Date Navigation & Filters */}
      <Card className="p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Month / Week title & step controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <Button onClick={handleToday} variant="secondary" size="sm">
              Today
            </Button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-sm font-bold text-slate-800 ml-2">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Doctor & Service Filters */}
          <div className="flex items-center gap-3">
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Doctors</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Services</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* CALENDAR VIEWS */}
      {viewMode === 'week' ? (
        /* WEEK VIEW GRID */
        <Card className="overflow-x-auto shadow-2xs">
          <div className="min-w-[800px]">
            {/* Week Header */}
            <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/70 text-center text-xs font-semibold text-slate-700">
              <div className="py-3 px-2 border-r border-slate-200 text-slate-400">Time</div>
              {weekDays.map((d, i) => {
                const isToday = d.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={i}
                    className={`py-3 px-2 border-r border-slate-200 last:border-r-0 ${
                      isToday ? 'bg-brand-50/80 text-brand-700' : ''
                    }`}
                  >
                    <p className="uppercase text-[10px] tracking-wider text-slate-400">
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className={`text-sm font-bold ${isToday ? 'text-brand-600' : 'text-slate-800'}`}>
                      {d.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Time Grid Rows */}
            <div className="divide-y divide-slate-100">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 min-h-[58px]">
                  {/* Time label */}
                  <div className="p-2 border-r border-slate-200 text-[11px] font-mono text-slate-400 text-center flex items-center justify-center bg-slate-50/40">
                    {time}
                  </div>

                  {/* Day cells */}
                  {weekDays.map((dayObj, dayIdx) => {
                    const dateStr = dayObj.toISOString().slice(0, 10);
                    const matchingAppointments = appointments.filter(
                      (a) => a.date === dateStr && a.startTime === time
                    );
                    const isBlocked = blockedSlots.some(
                      (b) => b.date === dateStr && b.startTime <= time && b.endTime > time
                    );

                    return (
                      <div
                        key={dayIdx}
                        onClick={() => {
                          if (!matchingAppointments.length && !isBlocked) {
                            setSelectedSlotDate(dateStr);
                            setSelectedSlotTime(time);
                            setSlotModalOpen(true);
                          }
                        }}
                        className={`p-1.5 border-r border-slate-200 last:border-r-0 relative transition-colors ${
                          isBlocked
                            ? 'bg-slate-100 cursor-not-allowed'
                            : matchingAppointments.length > 0
                            ? 'bg-white'
                            : 'hover:bg-brand-50/30 cursor-pointer'
                        }`}
                      >
                        {isBlocked ? (
                          <div className="h-full rounded-lg bg-slate-200/80 flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-500">
                            <Ban className="w-3 h-3" />
                            <span>Blocked</span>
                          </div>
                        ) : (
                          matchingAppointments.map((apt) => (
                            <div
                              key={apt._id}
                              className="p-1.5 rounded-lg border text-xs font-medium shadow-2xs overflow-hidden"
                              style={{
                                backgroundColor: apt.serviceId?.color ? `${apt.serviceId.color}15` : '#eff6ff',
                                borderColor: apt.serviceId?.color || '#3b82f6',
                              }}
                            >
                              <p className="font-bold text-slate-900 truncate text-[11px]">
                                {apt.patientDetails?.name}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {apt.serviceId?.name} • {apt.doctorId?.name?.split(' ')[1]}
                              </p>
                              <Badge status={apt.status} size="sm" className="mt-1" />
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : viewMode === 'day' ? (
        /* DAY VIEW */
        <Card className="p-6">
          <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <span className="text-xs text-slate-500">
              {appointments.filter((a) => a.date === currentDate.toISOString().slice(0, 10)).length} appointments today
            </span>
          </div>

          <div className="space-y-2">
            {timeSlots.map((time) => {
              const dateStr = currentDate.toISOString().slice(0, 10);
              const matching = appointments.filter((a) => a.date === dateStr && a.startTime === time);

              return (
                <div
                  key={time}
                  onClick={() => {
                    if (!matching.length) {
                      setSelectedSlotDate(dateStr);
                      setSelectedSlotTime(time);
                      setSlotModalOpen(true);
                    }
                  }}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                    matching.length > 0
                      ? 'bg-white border-slate-200'
                      : 'border-slate-100 hover:bg-slate-50 hover:border-slate-300 cursor-pointer'
                  }`}
                >
                  <span className="w-16 font-mono text-xs font-bold text-slate-600">{time}</span>
                  {matching.length > 0 ? (
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{matching[0].patientDetails?.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {matching[0].serviceId?.name} with {matching[0].doctorId?.name}
                        </p>
                      </div>
                      <Badge status={matching[0].status} />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Open slot - click to book or block</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* MONTH VIEW */
        <Card className="p-6">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, idx) => {
              const dayNum = (idx % 31) + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const count = appointments.filter((a) => a.date === dateStr).length;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    const newD = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
                    setCurrentDate(newD);
                    setViewMode('day');
                  }}
                  className="min-h-[70px] p-2 rounded-xl border border-slate-100 hover:border-brand-400 hover:bg-brand-50/20 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-slate-700">{dayNum}</span>
                  {count > 0 && (
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 py-0.5 px-1.5 rounded-full border border-brand-200 text-center">
                      {count} {count === 1 ? 'apt' : 'apts'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* SLOT CLICK MODAL: BOOK OR BLOCK */}
      <Modal
        isOpen={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        title="Manage Slot"
        description={`${selectedSlotTime} on ${selectedSlotDate}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-800">Block this time slot</p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Prevent patients from booking during this doctor shift.
            </p>

            <div className="mt-3">
              <label className="block text-slate-700 font-medium mb-1">Reason</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. Lunch break, Personal appointment, Surgery"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <Button
              onClick={handleBlockSlotSubmit}
              variant="danger"
              size="sm"
              icon={Ban}
              className="mt-3 w-full"
            >
              Block Slot
            </Button>
          </div>

          <div className="text-center pt-2">
            <span className="text-slate-400 text-xs">or create an appointment for this slot in Reception:</span>
            <div className="mt-2">
              <Button
                onClick={() => {
                  setSlotModalOpen(false);
                  window.location.href = `/appointments?new=true&date=${selectedSlotDate}&time=${selectedSlotTime}`;
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                + Book Patient for this slot
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
