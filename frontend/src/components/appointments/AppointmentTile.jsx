import React from 'react';
import {
  Clock,
  Phone,
  RotateCcw,
  Calendar,
  FileText,
  User,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusDropdown } from './StatusDropdown';

export const AppointmentTile = ({
  appointment,
  onStatusChange,
  onReschedule,
  onFollowUp,
  onViewFormData,
  onOpenPatientDialog,
}) => {
  const apt = appointment;
  const patientName = apt.patientDetails?.name || 'Patient';
  const patientInitial = patientName.charAt(0).toUpperCase();

  // Booking source label styling
  const sourceColors = {
    QR: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    BOOKING_LINK: 'bg-blue-50 text-blue-700 border-blue-200',
    RECEPTION: 'bg-purple-50 text-purple-700 border-purple-200',
    WALK_IN: 'bg-amber-50 text-amber-800 border-amber-200',
    ADMIN: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sourceClass = sourceColors[apt.bookingSource] || 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <Card
      hover
      className="p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md border border-slate-200/90 rounded-2xl bg-white relative group"
    >
      {/* Top Header: Time, Token, Number */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3.5 pb-3 border-b border-slate-100">
          {/* Time & Date Box */}
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-center shadow-2xs">
              <span className="font-mono text-xs font-black tracking-tight">{apt.startTime}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-700">{apt.date}</span>
              <span className="text-[10px] font-mono text-slate-400">{apt.appointmentNumber}</span>
            </div>
          </div>

          {/* Queue Token Badge */}
          {apt.queueToken ? (
            <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 shadow-2xs">
              <span className="font-mono text-xs font-extrabold text-brand-700">
                Token {apt.queueToken}
              </span>
            </div>
          ) : (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase ${sourceClass}`}
            >
              {apt.bookingSource}
            </span>
          )}
        </div>

        {/* Patient Profile Section - Clickable to open dialog */}
        <div
          onClick={() => onOpenPatientDialog && onOpenPatientDialog(apt)}
          className="flex items-start gap-3 mb-3.5 p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group/patient"
          title="Click to view patient details, history & clinical actions"
        >
          {/* Avatar initial */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs flex-shrink-0 group-hover/patient:scale-105 transition-transform">
            {patientInitial}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-slate-900 group-hover/patient:text-brand-600 truncate tracking-tight transition-colors">
                {patientName}
              </h3>
              <span className="text-[10px] text-slate-400 opacity-0 group-hover/patient:opacity-100 transition-opacity">
                ↗
              </span>
            </div>

            {apt.patientDetails?.phone && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `tel:${apt.patientDetails.phone}`;
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 transition-colors mt-0.5"
              >
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{apt.patientDetails.phone}</span>
              </span>
            )}
          </div>
        </div>

        {/* Service & Doctor Details */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-2 mb-3.5 text-xs">
          {/* Service */}
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-bold text-slate-900 truncate">
              {apt.serviceId?.name || 'Service Consultation'}
            </span>
            <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {apt.duration}m
            </span>
          </div>

          {/* Doctor */}
          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
            <Stethoscope className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
            <span className="truncate">
              Doctor:{' '}
              <strong className="text-slate-800 font-semibold">
                {apt.doctorId?.name || 'Assigned Doctor'}
              </strong>
            </span>
          </div>

          {/* Booking Source (if token was present above) */}
          {apt.queueToken && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[10px] text-slate-500">
              <span>Booking Channel</span>
              <span className="font-semibold text-slate-700">{apt.bookingSource}</span>
            </div>
          )}
        </div>

        {/* Notes if any */}
        {apt.internalNotes && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 italic flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2">Note: {apt.internalNotes}</p>
          </div>
        )}
      </div>

      {/* Card Footer: Status Dropdown & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
        {/* Status Dropdown */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Status
          </span>
          <StatusDropdown
            status={apt.status}
            onChange={(newStatus) => onStatusChange(apt._id, newStatus)}
          />
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-end gap-1.5 pt-1">
          <Button
            onClick={() => onOpenPatientDialog && onOpenPatientDialog(apt)}
            variant="outline"
            size="sm"
            icon={User}
            className="text-[11px] py-1 px-2.5 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
            title="Open full patient chart, history & clinical actions"
          >
            Chart
          </Button>
          <Button
            onClick={() => onReschedule(apt)}
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            className="text-[11px] py-1 px-2.5 text-slate-600 hover:text-slate-900"
            title="Reschedule appointment"
          >
            Reschedule
          </Button>

          <Button
            onClick={() => onFollowUp(apt)}
            variant="outline"
            size="sm"
            icon={Calendar}
            className="text-[11px] py-1 px-2.5 text-brand-600 border-brand-200 hover:bg-brand-50"
            title="Book follow-up"
          >
            Follow-up
          </Button>

          {apt.formData && Object.keys(apt.formData).length > 0 && (
            <Button
              onClick={() => onViewFormData(apt)}
              variant="ghost"
              size="sm"
              icon={FileText}
              className="text-[11px] py-1 px-2 text-slate-600"
              title="View intake form"
            >
              Form
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
