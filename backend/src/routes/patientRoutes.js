import { Router } from 'express';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  addPatientNote,
  addPatientAttachment,
} from '../controllers/patientController.js';
import { authenticate, requireClinic } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireClinic);

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.post('/:id/notes', addPatientNote);
router.post('/:id/attachments', addPatientAttachment);

export default router;
