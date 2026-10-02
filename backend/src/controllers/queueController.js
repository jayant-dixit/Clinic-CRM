import { Queue } from '../models/Queue.js';
import { Appointment } from '../models/Appointment.js';

export const getTodayQueue = async (req, res, next) => {
  try {
    const today = req.query.date || new Date().toISOString().slice(0, 10);

    let queue = await Queue.findOne({ clinicId: req.clinicId, date: today });
    if (!queue) {
      queue = await Queue.create({
        clinicId: req.clinicId,
        date: today,
        currentTokenSeq: 0,
        currentlyServingSeq: 0,
        items: [],
      });
    }

    const waitingItems = queue.items.filter((i) => i.status === 'WAITING');
    const currentlyServing = queue.items.find((i) => i.status === 'IN_PROGRESS') || null;

    return res.status(200).json({
      success: true,
      data: {
        date: queue.date,
        currentlyServingSeq: queue.currentlyServingSeq,
        currentlyServingToken: currentlyServing ? currentlyServing.tokenNumber : (queue.currentlyServingSeq > 0 ? `#${String(queue.currentlyServingSeq).padStart(2, '0')}` : 'None'),
        currentlyServing,
        totalWaiting: waitingItems.length,
        totalServedToday: queue.items.filter((i) => i.status === 'COMPLETED').length,
        items: queue.items,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const callNextPatient = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const queue = await Queue.findOne({ clinicId: req.clinicId, date: today });

    if (!queue || !queue.items.length) {
      return res.status(404).json({ success: false, message: 'No queue active today' });
    }

    // If another is currently in progress, mark it completed or keep it
    const activeItem = queue.items.find((i) => i.status === 'IN_PROGRESS');
    if (activeItem) {
      activeItem.status = 'COMPLETED';
      await Appointment.updateOne({ _id: activeItem.appointmentId }, { status: 'COMPLETED' });
    }

    // Find next WAITING item
    const nextItem = queue.items.find((i) => i.status === 'WAITING');
    if (!nextItem) {
      return res.status(200).json({
        success: true,
        message: 'No more waiting patients in queue.',
        data: queue,
      });
    }

    nextItem.status = 'IN_PROGRESS';
    queue.currentlyServingSeq = nextItem.tokenSeq;
    await queue.save();

    // Update appointment status to IN_PROGRESS
    await Appointment.updateOne(
      { _id: nextItem.appointmentId },
      { status: 'IN_PROGRESS', queueCalledAt: new Date() }
    );

    return res.status(200).json({
      success: true,
      message: `Calling patient ${nextItem.patientName} (${nextItem.tokenNumber})`,
      data: {
        calledItem: nextItem,
        queue,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const skipPatient = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const today = new Date().toISOString().slice(0, 10);
    const queue = await Queue.findOne({ clinicId: req.clinicId, date: today });

    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found' });
    }

    const item = queue.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Queue item not found' });
    }

    item.status = 'SKIPPED';
    await queue.save();

    return res.status(200).json({ success: true, message: `Patient ${item.patientName} marked skipped`, data: queue });
  } catch (error) {
    next(error);
  }
};

export const completeCurrentPatient = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const today = new Date().toISOString().slice(0, 10);
    const queue = await Queue.findOne({ clinicId: req.clinicId, date: today });

    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found' });
    }

    const item = queue.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Queue item not found' });
    }

    item.status = 'COMPLETED';
    await queue.save();

    await Appointment.updateOne({ _id: item.appointmentId }, { status: 'COMPLETED' });

    return res.status(200).json({ success: true, message: `Patient ${item.patientName} consultation completed`, data: queue });
  } catch (error) {
    next(error);
  }
};
