import React, { useState } from 'react';
import { useScyther } from '../context/ScytherContext';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  Calendar, 
  Check, 
  AlertCircle, 
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { BloodType } from '@shared/types/bloodchain';

export const CentersLocator: React.FC = () => {
  const { centers, donor, bookAppointment, bookedAppointment } = useScyther();
  const [selectedCenterId, setSelectedCenterId] = useState<string>(centers[0]?.id || '');
  const [bookingDate, setBookingDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [bookingTime, setBookingTime] = useState<string>('10:30 AM');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  const selectedCenter = centers.find(c => c.id === selectedCenterId) || centers[0];

  const timeSlots = [
    '08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM',
    '01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM'
  ];

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const ok = await bookAppointment(selectedCenterId, bookingDate, bookingTime);
      if (ok) {
        setBookingSuccess(true);
        setTimeout(() => setBookingSuccess(false), 6000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="text-xs font-mono font-bold text-red-500 uppercase tracking-wider mb-1 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span>Sovereign Phlebotomy Facilities</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Donation Centres & Appointment Booking
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Locate your nearest national blood bank, check real-time district blood deficits, and reserve a guaranteed phlebotomy slot.
        </p>
      </div>

      {/* Confirmed Booking Banner */}
      {bookedAppointment && (
        <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold">Confirmed Booking</div>
              <div className="text-sm font-bold text-white">{bookedAppointment.centerName}</div>
              <div className="text-xs text-slate-300 font-mono mt-0.5">
                Date: {bookedAppointment.date} · Slot: {bookedAppointment.time} · Fast-Track Intake Bay
              </div>
            </div>
          </div>

          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">
            Pass Ready on Bloodcard
          </span>
        </div>
      )}

      {/* Main Grid: Left Center Cards, Right Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Botswana Centers List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-mono text-slate-400 uppercase font-semibold">
            Regional Healthcare Centers ({centers.length})
          </div>

          <div className="space-y-3">
            {centers.map(center => {
              const isSelected = center.id === selectedCenterId;
              const hasDonorTypeUrgency = center.urgentNeeds.includes(donor.bloodType);

              return (
                <div
                  key={center.id}
                  onClick={() => setSelectedCenterId(center.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.07] border-red-500 shadow-xl ring-1 ring-red-500/40'
                      : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-base flex items-center gap-2">
                        <span>{center.name}</span>
                        {hasDonorTypeUrgency && (
                          <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                            <Flame className="w-3 h-3 text-red-400" />
                            <span>Needs your {donor.bloodType}!</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>{center.address}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                      {center.district}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{center.hours}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{center.phone}</span>
                    </div>
                  </div>

                  {/* Urgent Needs Chips */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">Critical Deficit:</span>
                    <div className="flex items-center gap-1">
                      {center.urgentNeeds.map(type => (
                        <span
                          key={type}
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            type === donor.bloodType
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Slot Booking Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
          <div>
            <div className="text-xs font-mono font-bold text-red-500 uppercase tracking-wide">
              Fast-Track Reservation
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Book Your Chair</h3>
            <p className="text-xs text-slate-400 mt-1">
              Selected: <strong className="text-white">{selectedCenter.name}</strong>
            </p>
          </div>

          <form onSubmit={handleConfirmBooking} className="space-y-5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Select Date</label>
              <input
                type="date"
                required
                value={bookingDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setBookingDate(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2">Available Time Slots</label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setBookingTime(slot)}
                    className={`py-2 px-3 rounded-xl border text-center font-mono text-xs transition-all cursor-pointer ${
                      bookingTime === slot
                        ? 'bg-red-600 text-white font-bold border-red-500 shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-slate-400 text-[11px]">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Wait Guarantee</span>
              </div>
              <p>
                Present your Digital Bloodcard QR upon arrival at {selectedCenter.name} for immediate phlebotomy prioritization.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming Reservation...' : 'Confirm Appointment Slot'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
