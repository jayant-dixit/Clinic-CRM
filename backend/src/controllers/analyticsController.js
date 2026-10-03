import { Appointment } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';
import { Service } from '../models/Service.js';
import { Doctor } from '../models/Doctor.js';

export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const clinicId = req.clinicId;

    // Total counts
    const totalAppointments = await Appointment.countDocuments({ clinicId });
    const completedAppointments = await Appointment.countDocuments({ clinicId, status: 'COMPLETED' });
    const cancelledAppointments = await Appointment.countDocuments({ clinicId, status: 'CANCELLED' });
    const noShowAppointments = await Appointment.countDocuments({ clinicId, status: 'NO_SHOW' });

    const totalPatients = await Patient.countDocuments({ clinicId });
    const newPatients = await Patient.countDocuments({ clinicId, totalVisits: { $lte: 1 } });
    const returningPatients = Math.max(0, totalPatients - newPatients);

    // Rates
    const cancellationRate = totalAppointments > 0 ? ((cancelledAppointments / totalAppointments) * 100).toFixed(1) : 0;
    const noShowRate = totalAppointments > 0 ? ((noShowAppointments / totalAppointments) * 100).toFixed(1) : 0;

    // Appointments over the last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const appointmentsByDay = await Promise.all(
      days.map(async (day) => {
        const count = await Appointment.countDocuments({ clinicId, date: day });
        const completed = await Appointment.countDocuments({ clinicId, date: day, status: 'COMPLETED' });
        const [year, month, dateNum] = day.split('-');
        const dateObj = new Date(Number(year), Number(month) - 1, Number(dateNum));
        const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
        return {
          date: day,
          label: dayLabel,
          total: count,
          completed,
        };
      })
    );

    // Appointments by Service (popular services)
    const serviceAggregation = await Appointment.aggregate([
      { $match: { clinicId } },
      { $group: { _id: '$serviceId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    const serviceIds = serviceAggregation.map((s) => s._id);
    const services = await Service.find({ _id: { $in: serviceIds } }).select('name color price');

    const popularServices = serviceAggregation.map((item) => {
      const s = services.find((srv) => srv._id.toString() === item._id?.toString());
      return {
        name: s ? s.name : 'Other',
        count: item.count,
        color: s?.color || '#3b82f6',
        price: s?.price || 0,
      };
    });

    // Appointments by Doctor
    const doctorAggregation = await Appointment.aggregate([
      { $match: { clinicId } },
      { $group: { _id: '$doctorId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    const doctorIds = doctorAggregation.map((d) => d._id);
    const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select('name specialization');

    const doctorLoads = doctorAggregation.map((item) => {
      const d = doctors.find((doc) => doc._id.toString() === item._id?.toString());
      return {
        name: d ? d.name : 'Doctor',
        specialization: d?.specialization || 'General Practice',
        count: item.count,
      };
    });

    // Peak booking hours distribution
    const hourlyDistribution = await Appointment.aggregate([
      { $match: { clinicId } },
      {
        $project: {
          hour: { $substr: ['$startTime', 0, 2] },
        },
      },
      { $group: { _id: '$hour', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const peakHours = hourlyDistribution.map((h) => ({
      hour: `${h._id}:00`,
      count: h.count,
    }));

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          noShowAppointments,
          totalPatients,
          newPatients,
          returningPatients,
          cancellationRate,
          noShowRate,
        },
        appointmentsByDay,
        popularServices,
        doctorLoads,
        peakHours,
      },
    });
  } catch (error) {
    next(error);
  }
};
