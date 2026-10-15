import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWedding } from '../contexts/useWedding';
import { PageLoader } from '../components/PageLoader';
import { db } from '../lib/supabase';
import type { ClientRecord } from '../types';
import type { Note, CommunicationEntry, VendorEntry, PaymentEntry, VisionNote, MilestoneEntry } from '../types/clientProfile';
import { ClientHeader } from '../components/ClientProfile/ClientHeader';
import { QuickActionsReminders } from '../components/ClientProfile/QuickActionsReminders';
import { ClientIntakeSection } from '../components/ClientProfile/ClientIntakeSection';
import { ClientOverviewCards } from '../components/ClientProfile/ClientOverviewCards';
import { NotesSection } from '../components/ClientProfile/NotesSection';
import { CommunicationLogSection } from '../components/ClientProfile/CommunicationLogSection';
import { VendorTrackingSection } from '../components/ClientProfile/VendorTrackingSection';
import { VisionNotesSection } from '../components/ClientProfile/VisionNotesSection';
import { PaymentTrackingSection } from '../components/ClientProfile/PaymentTrackingSection';
import { MilestonesSection } from '../components/ClientProfile/MilestonesSection';
import { MoodBoardPreview } from '../components/ClientProfile/MoodBoardPreview';

interface ClientProfileProps {}

export const ClientProfile: React.FC<ClientProfileProps> = () => {
  const { userRole } = useAuth();
  const { activeWeddingId } = useWedding();
  const { weddingId } = useParams<{ weddingId: string }>();
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const basePath =
    userRole === 'planner' ? (activeWeddingId ? `/dashboard/${activeWeddingId}` : '/dashboard') : '/couple/dashboard';

  useEffect(() => {
    const loadClient = async () => {
      if (!weddingId) {
        setClient(null);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const clientRecord = await db.getClientForWedding(weddingId);
        setClient(clientRecord);
      } catch {
        setClient(null);
        setError('We could not load this client profile right now. Please try again in a moment.');
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [weddingId]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [communication, setCommunication] = useState<CommunicationEntry[]>([]);
  const [communicationLoading, setCommunicationLoading] = useState(false);
  const [communicationError, setCommunicationError] = useState<string | null>(null);
  const [communicationSaving, setCommunicationSaving] = useState(false);
  const [commType, setCommType] = useState('');
  const [commSummary, setCommSummary] = useState('');
  const [commDate, setCommDate] = useState('');
  const [commFollowUp, setCommFollowUp] = useState('');

  const [vendors, setVendors] = useState<VendorEntry[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorsError, setVendorsError] = useState<string | null>(null);
  const [vendorSaving, setVendorSaving] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('');
  const [vendorStatus, setVendorStatus] = useState<'pending' | 'contacted' | 'booked'>('pending');
  const [vendorNote, setVendorNote] = useState('');

  const [visionNotes, setVisionNotes] = useState<VisionNote[]>([]);
  const [visionNotesLoading, setVisionNotesLoading] = useState(false);
  const [visionNotesError, setVisionNotesError] = useState<string | null>(null);
  const [visionSaving, setVisionSaving] = useState(false);
  const [visionTitle, setVisionTitle] = useState('');
  const [visionDescription, setVisionDescription] = useState('');
  const [visionCategory, setVisionCategory] = useState('');

  const [milestones, setMilestones] = useState<MilestoneEntry[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);
  const [milestonesError, setMilestonesError] = useState<string | null>(null);
  const [milestoneSaving, setMilestoneSaving] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [milestoneStatus, setMilestoneStatus] = useState<'upcoming' | 'in progress' | 'completed'>('upcoming');
  const [milestoneNote, setMilestoneNote] = useState('');

  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentTitle, setPaymentTitle] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'unpaid'>('unpaid');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const [intakeCoupleNames, setIntakeCoupleNames] = useState(client?.coupleNames || '');
  const [intakeWeddingDate, setIntakeWeddingDate] = useState(client?.weddingDate || '');
  const [intakeCeremonyVenue, setIntakeCeremonyVenue] = useState(client?.ceremonyVenue || '');
  const [intakeReceptionVenue, setIntakeReceptionVenue] = useState(client?.receptionVenue || '');
  const [intakeGuestCount, setIntakeGuestCount] = useState(client?.guestCount?.toString() || '');
  const [intakeBudget, setIntakeBudget] = useState(client?.budget?.toString() || '');
  const [intakePlanningStage, setIntakePlanningStage] = useState(client?.planningStage || '');
  const [intakeWeddingStyle, setIntakeWeddingStyle] = useState(client?.weddingStyle || '');
  const [intakePreferredColors, setIntakePreferredColors] = useState(client?.preferredColors || '');
  const [intakeTopPriorities, setIntakeTopPriorities] = useState(client?.topPriorities || '');
  const [intakeMustHaves, setIntakeMustHaves] = useState(client?.mustHaves || '');
  const [intakeDoNotWant, setIntakeDoNotWant] = useState(client?.doNotWant || '');
  const [intakeMainHelpNeeded, setIntakeMainHelpNeeded] = useState(client?.mainHelpNeeded || '');
  const [intakeBiggestConcern, setIntakeBiggestConcern] = useState(client?.biggestConcern || '');
  const [intakeCommunicationPreference, setIntakeCommunicationPreference] = useState(client?.communicationPreference || '');
  const [intakeAdditionalNotes, setIntakeAdditionalNotes] = useState(client?.additionalNotes || '');

  useEffect(() => {
    if (!client) {
      setIntakeCoupleNames('');
      setIntakeWeddingDate('');
      setIntakeCeremonyVenue('');
      setIntakeReceptionVenue('');
      setIntakeGuestCount('');
      setIntakeBudget('');
      setIntakePlanningStage('');
      setIntakeWeddingStyle('');
      setIntakePreferredColors('');
      setIntakeTopPriorities('');
      setIntakeMustHaves('');
      setIntakeDoNotWant('');
      setIntakeMainHelpNeeded('');
      setIntakeBiggestConcern('');
      setIntakeCommunicationPreference('');
      setIntakeAdditionalNotes('');
      return;
    }

    setIntakeCoupleNames(client.coupleNames ?? '');
    setIntakeWeddingDate(client.weddingDate ?? '');
    setIntakeCeremonyVenue(client.ceremonyVenue ?? '');
    setIntakeReceptionVenue(client.receptionVenue ?? '');
    setIntakeGuestCount(client.guestCount == null ? '' : String(client.guestCount));
    setIntakeBudget(client.budget == null ? '' : String(client.budget));
    setIntakePlanningStage(client.planningStage ?? '');
    setIntakeWeddingStyle(client.weddingStyle ?? '');
    setIntakePreferredColors(client.preferredColors ?? '');
    setIntakeTopPriorities(client.topPriorities ?? '');
    setIntakeMustHaves(client.mustHaves ?? '');
    setIntakeDoNotWant(client.doNotWant ?? '');
    setIntakeMainHelpNeeded(client.mainHelpNeeded ?? '');
    setIntakeBiggestConcern(client.biggestConcern ?? '');
    setIntakeCommunicationPreference(client.communicationPreference ?? '');
    setIntakeAdditionalNotes(client.additionalNotes ?? '');
  }, [client]);

  useEffect(() => {
    if (!weddingId) {
      setNotes([]);
      setNotesError(null);
      setNotesLoading(false);
      return;
    }

    let isCurrent = true;

    const loadNotesForWedding = async () => {
      setNotes([]);
      setNotesLoading(true);
      setNotesError(null);

      try {
        const nextNotes = await db.getNotesForWedding(weddingId);
        if (isCurrent) {
          setNotes(nextNotes);
        }
      } catch (err) {
        if (isCurrent) {
          setNotes([]);
          setNotesError('We could not load notes for this wedding right now. Please try again.');
        }
      } finally {
        if (isCurrent) {
          setNotesLoading(false);
        }
      }
    };

    void loadNotesForWedding();

    return () => {
      isCurrent = false;
    };
  }, [weddingId]);

  useEffect(() => {
    if (!weddingId) {
      setCommunication([]);
      setCommunicationError(null);
      setCommunicationLoading(false);
      return;
    }

    let isCurrent = true;

    const loadCommunicationLogsForWedding = async () => {
      setCommunication([]);
      setCommunicationLoading(true);
      setCommunicationError(null);

      try {
        const nextEntries = await db.getCommunicationLogsForWedding(weddingId);
        if (isCurrent) {
          setCommunication(nextEntries);
        }
      } catch (err) {
        if (isCurrent) {
          setCommunication([]);
          setCommunicationError('We could not load the communication log for this wedding right now. Please try again.');
        }
      } finally {
        if (isCurrent) {
          setCommunicationLoading(false);
        }
      }
    };

    void loadCommunicationLogsForWedding();

    return () => {
      isCurrent = false;
    };
  }, [weddingId]);

  useEffect(() => {
    if (!weddingId) {
      setVendors([]);
      setVendorsError(null);
      setVendorsLoading(false);
      return;
    }

    let isCurrent = true;

    const loadVendorsForWedding = async () => {
      setVendors([]);
      setVendorsLoading(true);
      setVendorsError(null);

      try {
        const nextVendors = await db.getVendorsForWedding(weddingId);
        if (isCurrent) {
          setVendors(nextVendors);
        }
      } catch (err) {
        if (isCurrent) {
          setVendors([]);
          setVendorsError('We could not load vendors for this wedding right now. Please try again.');
        }
      } finally {
        if (isCurrent) {
          setVendorsLoading(false);
        }
      }
    };

    void loadVendorsForWedding();

    return () => {
      isCurrent = false;
    };
  }, [weddingId]);

  useEffect(() => {
    if (!weddingId) {
      setPayments([]);
      setPaymentsError(null);
      setPaymentsLoading(false);
      return;
    }

    let isCurrent = true;

    const loadPaymentsForWedding = async () => {
      setPayments([]);
      setPaymentsLoading(true);
      setPaymentsError(null);

      try {
        const nextPayments = await db.getPaymentsForWedding(weddingId);
        if (isCurrent) {
          setPayments(nextPayments);
        }
      } catch (err) {
        if (isCurrent) {
          setPayments([]);
          setPaymentsError('We could not load payment tracking for this wedding right now. Please try again.');
        }
      } finally {
        if (isCurrent) {
          setPaymentsLoading(false);
        }
      }
    };

    void loadPaymentsForWedding();

    return () => {
      isCurrent = false;
    };
  }, [weddingId]);

  useEffect(() => {
    if (!weddingId) {
      setMilestones([]);
      setMilestonesError(null);
      setMilestonesLoading(false);
      return;
    }

    let isCurrent = true;

    const loadMilestonesForWedding = async () => {
      setMilestones([]);
      setMilestonesLoading(true);
      setMilestonesError(null);

      try {
        const nextMilestones = await db.getMilestonesForWedding(weddingId);
        if (isCurrent) {
          setMilestones(nextMilestones);
        }
      } catch (err) {
        if (isCurrent) {
          setMilestones([]);
          setMilestonesError('We could not load milestones for this wedding right now. Please try again.');
        }
      } finally {
        if (isCurrent) {
          setMilestonesLoading(false);
        }
      }
    };

    void loadMilestonesForWedding();

    return () => {
      isCurrent = false;
    };
  }, [weddingId]);

  useEffect(() => {
    if (!weddingId) {
      setVisionNotes([]);
      setVisionNotesError(null);
      setVisionNotesLoading(false);
      return;
    }

    let isCurrent = true;

    const loadVisionNotesForWedding = async () => {
      setVisionNotes([]);
      setVisionNotesLoading(true);
      setVisionNotesError(null);

      try {
        const nextNotes = await db.getVisionNotesForWedding(weddingId);
        if (isCurrent) {
          setVisionNotes(nextNotes);
        }
      } catch (err) {
        if (isCurrent) {
          setVisionNotes([]);
          setVisionNotesError('We could not load vision notes for this wedding right now. Please try again.');
        }
      } finally {
        if (isCurrent) {
          setVisionNotesLoading(false);
        }
      }
    };

    void loadVisionNotesForWedding();

    return () => {
      isCurrent = false;
    };
  }, [weddingId]);

  const totalVendors = vendors.length;
  const bookedVendors = vendors.filter((vendor) => vendor.status === 'booked').length;
  const paymentsPaid = payments.filter((payment) => payment.status === 'paid').length;
  const paymentsDue = payments.filter((payment) => payment.status !== 'paid').length;
  const milestoneCompleted = milestones.filter((milestone) => milestone.status === 'completed').length;

  const vendorReadiness = totalVendors > 0 ? Math.round((bookedVendors / totalVendors) * 100) : 0;
  const paymentReadiness = payments.length > 0 ? Math.round((paymentsPaid / payments.length) * 100) : 0;
  const milestoneCompletion = milestones.length > 0 ? Math.round((milestoneCompleted / milestones.length) * 100) : 0;
  const overallReadiness = Math.round((vendorReadiness + paymentReadiness + milestoneCompletion) / 3);
  const overallStatus = overallReadiness >= 90
    ? 'Wedding Ready'
    : overallReadiness >= 70
      ? 'Nearly Ready'
      : overallReadiness >= 40
        ? 'In Progress'
        : 'At Risk';

  const profileReadinessReady =
    !loading &&
    !error &&
    !!client &&
    !vendorsLoading &&
    !paymentsLoading &&
    !milestonesLoading &&
    !vendorsError &&
    !paymentsError &&
    !milestonesError;

  const profileProgress = profileReadinessReady ? overallReadiness : null;
  const profileStatus = profileReadinessReady ? overallStatus : null;

  const remindersDatasetsLoading = vendorsLoading || paymentsLoading || milestonesLoading;
  const remindersDatasetsError = !!(vendorsError || paymentsError || milestonesError);
  const remindersAllLoaded = !vendorsLoading && !paymentsLoading && !milestonesLoading && !vendorsError && !paymentsError && !milestonesError;

  const nextAction = (() => {
    const parseLocalDate = (d?: string | null) => {
      if (!d) return null;
      const isoDateMatch = /^\d{4}-\d{2}-\d{2}$/.exec(d);
      if (isoDateMatch) {
        const [y, m, day] = d.split('-').map(Number);
        return new Date(y, m - 1, day);
      }
      const dt = new Date(d);
      return Number.isNaN(dt.getTime()) ? null : dt;
    };

    const today = (() => {
      const n = new Date();
      return new Date(n.getFullYear(), n.getMonth(), n.getDate());
    })();

    // If key datasets are still loading or errored, return a neutral next action
    const datasetsReady = !vendorsLoading && !paymentsLoading && !milestonesLoading && !vendorsError && !paymentsError && !milestonesError;
    if (!datasetsReady) return 'Review planning items that need attention';

    const upcoming = payments.find((payment) => {
      if (payment.status === 'paid') return false;
      const due = parseLocalDate(payment.dueDate);
      if (!due) return false;
      const inSeven = new Date(today);
      inSeven.setDate(inSeven.getDate() + 7);
      return due >= today && due <= inSeven;
    });

    if (upcoming) return 'Payment due this week';

    const contactedVendor = vendors.find((vendor) => vendor.status === 'contacted');
    if (contactedVendor) return `Follow up with ${contactedVendor.category} quote`;

    const pendingVendor = vendors.find((vendor) => vendor.status === 'pending');
    if (pendingVendor) return `Follow up with ${pendingVendor.category} vendor`;

    if (payments.some((p) => p.status === 'partial')) return 'Finalize partial payments';

    return 'Review progress with couple';
  })();

  const reminders = (() => {
    const items = new Set<string>();

    const parseLocalDate = (d?: string | null) => {
      if (!d) return null;
      const isoDateMatch = /^\d{4}-\d{2}-\d{2}$/.exec(d);
      if (isoDateMatch) {
        const [y, m, day] = d.split('-').map(Number);
        return new Date(y, m - 1, day);
      }
      const dt = new Date(d);
      return Number.isNaN(dt.getTime()) ? null : dt;
    };

    const today = (() => {
      const n = new Date();
      return new Date(n.getFullYear(), n.getMonth(), n.getDate());
    })();

    const addIf = (cond: boolean, text: string) => { if (cond) items.add(text); };

    if (!vendorsLoading && !vendorsError) {
      addIf(vendors.some((vendor) => vendor.status === 'pending'), 'Follow up on pending vendor');
    }

    if (!paymentsLoading && !paymentsError) {
      addIf(payments.some((p) => p.status === 'partial'), 'Follow up on partial payments');

      addIf(payments.some((p) => {
        if (p.status === 'paid') return false;
        const due = parseLocalDate(p.dueDate);
        return due !== null && due < today;
      }), 'Payment overdue — follow up');

      addIf(payments.some((p) => {
        if (p.status === 'paid') return false;
        const due = parseLocalDate(p.dueDate);
        if (!due) return false;
        const inSeven = new Date(today);
        inSeven.setDate(inSeven.getDate() + 7);
        return due >= today && due <= inSeven;
      }), 'Payment due within 7 days');
    }

    if (!milestonesLoading && !milestonesError) {
      addIf(milestones.some((m) => m.status === 'in progress'), 'Milestone still in progress');

      addIf(milestones.some((m) => {
        if (m.status === 'completed') return false;
        const due = parseLocalDate(m.dueDate);
        return due !== null && due < today;
      }), 'Milestone overdue — follow up');
    }

    const allLoaded = !vendorsLoading && !paymentsLoading && !milestonesLoading && !vendorsError && !paymentsError && !milestonesError;
    if (allLoaded && items.size === 0) {
      items.add('All clear — keep momentum with your next action.');
    }

    return Array.from(items);
  })();

  const handleAddNote = async () => {
    if (!weddingId || noteSaving) return;

    const trimmedTitle = noteTitle.trim();
    const trimmedContent = noteContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      setNotesError('Please enter both a note title and content before saving.');
      return;
    }

    setNoteSaving(true);
    setNotesError(null);

    try {
      const createdNote = await db.createNoteForWedding(weddingId, trimmedTitle, trimmedContent);
      setNotes((prev) => [...prev, createdNote as Note]);
      setNoteTitle('');
      setNoteContent('');
    } catch (err) {
      setNotesError('We could not save this note right now. Please try again.');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleAddCommunication = async () => {
    if (!weddingId || communicationSaving) return;

    const trimmedType = commType.trim();
    const trimmedSummary = commSummary.trim();
    const trimmedDate = commDate.trim();

    if (!trimmedType || !trimmedSummary || !trimmedDate) {
      setCommunicationError('Please enter a communication type, summary, and date before saving.');
      return;
    }

    setCommunicationSaving(true);
    setCommunicationError(null);

    try {
      const createdEntry = await db.createCommunicationLogForWedding(weddingId, {
        type: trimmedType,
        summary: trimmedSummary,
        date: trimmedDate,
        followUp: commFollowUp.trim() || undefined,
      });

      setCommunication((prev) => [createdEntry, ...prev]);
      setCommType('');
      setCommSummary('');
      setCommDate('');
      setCommFollowUp('');
    } catch (err) {
      setCommunicationError('We could not save this communication log entry right now. Please try again.');
    } finally {
      setCommunicationSaving(false);
    }
  };

  const handleAddVendor = async () => {
    if (!weddingId || vendorSaving) return;

    const trimmedName = vendorName.trim();
    const trimmedCategory = vendorCategory.trim();

    if (!trimmedName || !trimmedCategory) {
      setVendorsError('Please enter a vendor name and category before saving.');
      return;
    }

    setVendorSaving(true);
    setVendorsError(null);

    try {
      const createdVendor = await db.createVendorForWedding(weddingId, {
        vendorName: trimmedName,
        category: trimmedCategory,
        status: vendorStatus,
        note: vendorNote.trim() || undefined,
      });

      setVendors((prev) => [createdVendor, ...prev]);
      setVendorName('');
      setVendorCategory('');
      setVendorStatus('pending');
      setVendorNote('');
    } catch (err) {
      setVendorsError('We could not save this vendor right now. Please try again.');
    } finally {
      setVendorSaving(false);
    }
  };

  const handleAddPayment = async () => {
    if (!weddingId || paymentSaving) return;

    const trimmedTitle = paymentTitle.trim();
    const sanitizedAmount = Number(paymentAmount);

    if (!trimmedTitle || !paymentDueDate.trim() || !Number.isFinite(sanitizedAmount) || sanitizedAmount < 0) {
      setPaymentsError('Please enter a valid payment title, amount, and due date before saving.');
      return;
    }

    setPaymentSaving(true);
    setPaymentsError(null);

    try {
      const createdPayment = await db.createPaymentForWedding(weddingId, {
        title: trimmedTitle,
        amount: sanitizedAmount,
        status: paymentStatus,
        dueDate: paymentDueDate,
        note: paymentNote.trim() || undefined,
      });

      setPayments((prev) => [createdPayment, ...prev]);
      setPaymentTitle('');
      setPaymentAmount('');
      setPaymentStatus('unpaid');
      setPaymentDueDate('');
      setPaymentNote('');
    } catch (err) {
      setPaymentsError('We could not save this payment right now. Please try again.');
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!weddingId || milestoneSaving) return;

    const trimmedTitle = milestoneTitle.trim();
    const trimmedDueDate = milestoneDueDate.trim();
    const trimmedNote = milestoneNote.trim();

    if (!trimmedTitle || !trimmedDueDate) {
      setMilestonesError('Please enter both a milestone title and due date before saving.');
      return;
    }

    if (!['upcoming', 'in progress', 'completed'].includes(milestoneStatus)) {
      setMilestonesError('Please choose a valid milestone status before saving.');
      return;
    }

    setMilestoneSaving(true);
    setMilestonesError(null);

    try {
      const createdMilestone = await db.createMilestoneForWedding(weddingId, {
        title: trimmedTitle,
        dueDate: trimmedDueDate,
        status: milestoneStatus,
        note: trimmedNote || undefined,
      });

      setMilestones((prev) => [createdMilestone, ...prev]);
      setMilestoneTitle('');
      setMilestoneDueDate('');
      setMilestoneStatus('upcoming');
      setMilestoneNote('');
    } catch (err) {
      setMilestonesError('We could not save this milestone right now. Please try again.');
    } finally {
      setMilestoneSaving(false);
    }
  };

  const handleAddVisionNote = async () => {
    if (userRole !== 'planner' || !weddingId || visionSaving) return;

    const trimmedTitle = visionTitle.trim();
    const trimmedDescription = visionDescription.trim();
    const trimmedCategory = visionCategory.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setVisionNotesError('Please enter both a title and description before saving.');
      return;
    }

    setVisionSaving(true);
    setVisionNotesError(null);

    try {
      const createdVisionNote = await db.createVisionNoteForWedding(weddingId, {
        title: trimmedTitle,
        description: trimmedDescription,
        category: trimmedCategory || undefined,
      });

      setVisionNotes((prev) => [createdVisionNote, ...prev]);
      setVisionTitle('');
      setVisionDescription('');
      setVisionCategory('');
    } catch (err) {
      setVisionNotesError('We could not save this vision note right now. Please try again.');
    } finally {
      setVisionSaving(false);
    }
  };

  const handleSaveIntake = async () => {
    if (!weddingId) {
      setSaveError('This client profile is missing a valid wedding context.');
      return;
    }

    if (!client) {
      setSaveError('The client information could not be loaded yet.');
      return;
    }

    const trimmedCoupleNames = intakeCoupleNames.trim();
    const trimmedWeddingDate = intakeWeddingDate.trim();

    if (!trimmedCoupleNames || !trimmedWeddingDate) {
      setSaveError('Couple names and wedding date are required before saving the client intake.');
      return;
    }

    const parseNullableText = (value: string) => value.trim() === '' ? null : value.trim();

    const guestCountValue = intakeGuestCount.trim();
    let normalizedGuestCount: number | null = null;
    if (guestCountValue !== '') {
      const parsedGuestCount = Number(guestCountValue);
      if (!Number.isFinite(parsedGuestCount)) {
        setSaveError('Please enter a valid guest count.');
        return;
      }
      normalizedGuestCount = parsedGuestCount;
    }

    const budgetValue = intakeBudget.trim();
    let normalizedBudget: number | null = null;
    if (budgetValue !== '') {
      const sanitizedBudget = budgetValue.replace(/[$,\s]/g, '');
      if (sanitizedBudget === '') {
        setSaveError('Please enter a valid budget value.');
        return;
      }
      const parsedBudget = Number(sanitizedBudget);
      if (!Number.isFinite(parsedBudget)) {
        setSaveError('Please enter a valid budget value.');
        return;
      }
      normalizedBudget = parsedBudget;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const updatedClient = await db.updateClientForWedding(weddingId, {
        weddingId: client.weddingId,
        coupleNames: trimmedCoupleNames,
        weddingDate: trimmedWeddingDate,
        ceremonyVenue: parseNullableText(intakeCeremonyVenue),
        receptionVenue: parseNullableText(intakeReceptionVenue),
        guestCount: normalizedGuestCount,
        budget: normalizedBudget,
        planningStage: parseNullableText(intakePlanningStage),
        weddingStyle: parseNullableText(intakeWeddingStyle),
        preferredColors: parseNullableText(intakePreferredColors),
        topPriorities: parseNullableText(intakeTopPriorities),
        mustHaves: parseNullableText(intakeMustHaves),
        doNotWant: parseNullableText(intakeDoNotWant),
        mainHelpNeeded: parseNullableText(intakeMainHelpNeeded),
        biggestConcern: parseNullableText(intakeBiggestConcern),
        communicationPreference: parseNullableText(intakeCommunicationPreference),
        additionalNotes: parseNullableText(intakeAdditionalNotes),
      });

      setClient(updatedClient);
      setIntakeCoupleNames(updatedClient.coupleNames ?? '');
      setIntakeWeddingDate(updatedClient.weddingDate ?? '');
      setIntakeCeremonyVenue(updatedClient.ceremonyVenue ?? '');
      setIntakeReceptionVenue(updatedClient.receptionVenue ?? '');
      setIntakeGuestCount(updatedClient.guestCount == null ? '' : String(updatedClient.guestCount));
      setIntakeBudget(updatedClient.budget == null ? '' : String(updatedClient.budget));
      setIntakePlanningStage(updatedClient.planningStage ?? '');
      setIntakeWeddingStyle(updatedClient.weddingStyle ?? '');
      setIntakePreferredColors(updatedClient.preferredColors ?? '');
      setIntakeTopPriorities(updatedClient.topPriorities ?? '');
      setIntakeMustHaves(updatedClient.mustHaves ?? '');
      setIntakeDoNotWant(updatedClient.doNotWant ?? '');
      setIntakeMainHelpNeeded(updatedClient.mainHelpNeeded ?? '');
      setIntakeBiggestConcern(updatedClient.biggestConcern ?? '');
      setIntakeCommunicationPreference(updatedClient.communicationPreference ?? '');
      setIntakeAdditionalNotes(updatedClient.additionalNotes ?? '');
      setSaveSuccess('Client intake saved successfully.');
    } catch (err) {
      setSaveError('We could not save the client intake right now. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!userRole) return <PageLoader />;

  if (!weddingId) {
    return (
      <div className="min-h-screen bg-cream page-enter flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gold/20 p-6 sm:p-8 lg:p-12 text-center max-w-lg mx-4">
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal mb-3 sm:mb-4">Missing wedding</h1>
          <p className="text-sm sm:text-base text-slate mb-5 sm:mb-6">This client profile requires a valid wedding context to load.</p>
          <Link
            to={activeWeddingId ? `${basePath}/clients` : '/dashboard'}
            className="btn-primary inline-block w-full sm:w-auto"
          >
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream page-enter flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gold/20 p-6 sm:p-8 lg:p-12 text-center max-w-lg mx-4">
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal mb-3 sm:mb-4">Unable to load client</h1>
          <p className="text-sm sm:text-base text-slate mb-5 sm:mb-6">{error}</p>
          <Link
            to={activeWeddingId ? `${basePath}/clients` : '/dashboard'}
            className="btn-primary inline-block w-full sm:w-auto"
          >
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-cream page-enter flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gold/20 p-6 sm:p-8 lg:p-12 text-center max-w-lg mx-4">
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal mb-3 sm:mb-4">Client not found</h1>
          <p className="text-sm sm:text-base text-slate mb-5 sm:mb-6">The requested client profile was not found for this wedding. Please select a valid client from the list.</p>
          <Link
            to={activeWeddingId ? `${basePath}/clients` : '/dashboard'}
            className="btn-primary inline-block w-full sm:w-auto"
          >
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream page-enter">
      <ClientHeader
        coupleNames={client.coupleNames}
        weddingDate={client.weddingDate}
        location={'Location unavailable'}
        progress={profileProgress}
        readinessLabel={profileStatus}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-5 sm:space-y-8">
          {userRole === 'planner' && (
            <QuickActionsReminders
              reminders={reminders}
              isLoading={remindersDatasetsLoading}
              hasError={remindersDatasetsError}
              allLoaded={remindersAllLoaded}
            />
          )}

          <div className="bg-white rounded-2xl border border-gold/20 p-4 sm:p-6 lg:p-7 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <div>
                <h2 className="text-xl font-serif text-charcoal mb-3">Wedding Date</h2>
                <p className="text-slate text-base sm:text-lg font-medium">{new Date(client.weddingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-serif text-charcoal mb-2 sm:mb-3">Location</h2>
                <p className="text-slate text-base sm:text-lg font-medium break-words">Location unavailable</p>
              </div>
            </div>

            <div className="mt-5 sm:mt-8 border-t border-gold/20 pt-4 sm:pt-6">
              <h2 className="text-xl sm:text-2xl font-serif text-charcoal mb-2 sm:mb-3">Planning Progress</h2>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <span className="text-sm text-slate">
                  {profileReadinessReady ? `${overallReadiness}% complete` : 'Progress unavailable'}
                </span>
                <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full w-fit ${profileReadinessReady ? 'text-charcoal bg-sand' : 'text-slate bg-slate-100'}`}>
                  {profileReadinessReady ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-gold" />
                      {overallStatus}
                    </>
                  ) : (
                    'Loading progress'
                  )}
                </span>
              </div>

              <div className="w-full bg-sand rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-gold h-3 rounded-full transition-all"
                  style={{ width: `${profileReadinessReady ? overallReadiness : 0}%` }}
                />
              </div>
            </div>
          </div>

          <ClientOverviewCards
            totalVendors={totalVendors}
            bookedVendors={bookedVendors}
            paymentsDue={paymentsDue}
            paymentsPaid={paymentsPaid}
            vendorReadiness={profileReadinessReady ? vendorReadiness : null}
            paymentReadiness={profileReadinessReady ? paymentReadiness : null}
            milestoneCompletion={profileReadinessReady ? milestoneCompletion : null}
            overallReadiness={profileReadinessReady ? overallReadiness : null}
            overallStatus={profileReadinessReady ? overallStatus : null}
          />

          <div className="rounded-2xl border border-gold/20 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
            <p className="text-[11px] sm:text-xs text-slate uppercase tracking-wide mb-1">
              {userRole === 'planner' ? 'Next action' : 'What’s next'}
            </p>
            <p className="text-sm sm:text-base font-medium text-charcoal leading-relaxed break-words">
              {userRole === 'planner' ? nextAction : 'Your planner is keeping everything on track. Here is the next key focus for your wedding.'}
            </p>
          </div>

          <div className="mb-2 sm:mb-3">
            <div
              className={`grid grid-cols-1 gap-5 sm:gap-8 ${
                userRole === 'planner' ? 'lg:grid-cols-[2fr_1fr]' : ''
              }`}
            >
              <div className="space-y-6 sm:space-y-7 lg:space-y-8">
                <ClientIntakeSection
                  userRole={userRole}
                  coupleNames={intakeCoupleNames}
                  weddingDate={intakeWeddingDate}
                  ceremonyVenue={intakeCeremonyVenue}
                  receptionVenue={intakeReceptionVenue}
                  guestCount={intakeGuestCount}
                  budget={intakeBudget}
                  planningStage={intakePlanningStage}
                  weddingStyle={intakeWeddingStyle}
                  preferredColors={intakePreferredColors}
                  topPriorities={intakeTopPriorities}
                  mustHaves={intakeMustHaves}
                  doNotWant={intakeDoNotWant}
                  mainHelpNeeded={intakeMainHelpNeeded}
                  biggestConcern={intakeBiggestConcern}
                  communicationPreference={intakeCommunicationPreference}
                  additionalNotes={intakeAdditionalNotes}
                  onCoupleNamesChange={setIntakeCoupleNames}
                  onWeddingDateChange={setIntakeWeddingDate}
                  onCeremonyVenueChange={setIntakeCeremonyVenue}
                  onReceptionVenueChange={setIntakeReceptionVenue}
                  onGuestCountChange={setIntakeGuestCount}
                  onBudgetChange={setIntakeBudget}
                  onPlanningStageChange={setIntakePlanningStage}
                  onWeddingStyleChange={setIntakeWeddingStyle}
                  onPreferredColorsChange={setIntakePreferredColors}
                  onTopPrioritiesChange={setIntakeTopPriorities}
                  onMustHavesChange={setIntakeMustHaves}
                  onDoNotWantChange={setIntakeDoNotWant}
                  onMainHelpNeededChange={setIntakeMainHelpNeeded}
                  onBiggestConcernChange={setIntakeBiggestConcern}
                  onCommunicationPreferenceChange={setIntakeCommunicationPreference}
                  onAdditionalNotesChange={setIntakeAdditionalNotes}
                />

                {userRole === 'planner' && (
                  <div className="rounded-2xl border border-gold/20 bg-white p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={handleSaveIntake}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>

                      {(saveError || saveSuccess) && (
                        <div className={`text-sm ${saveError ? 'text-red-700' : 'text-charcoal'}`}>
                          {saveError || saveSuccess}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {userRole === 'planner' && (
                  <>
                    {notesLoading && (
                      <div className="rounded-2xl border border-gold/20 bg-white p-4 text-sm text-slate shadow-sm">
                        Loading notes...
                      </div>
                    )}

                    {notesError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <span>{notesError}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (!weddingId) return;
                              void (async () => {
                                setNotes([]);
                                setNotesLoading(true);
                                setNotesError(null);
                                try {
                                  const nextNotes = await db.getNotesForWedding(weddingId);
                                  setNotes(nextNotes);
                                } catch (err) {
                                  setNotes([]);
                                  setNotesError('We could not load notes for this wedding right now. Please try again.');
                                } finally {
                                  setNotesLoading(false);
                                }
                              })();
                            }}
                            className="text-red-700 underline font-medium"
                          >
                            Retry
                          </button>
                        </div>
                      </div>
                    )}

                    {noteSaving && (
                      <div className="rounded-2xl border border-gold/20 bg-white p-3 text-sm text-slate shadow-sm">
                        Saving note...
                      </div>
                    )}

                    <NotesSection
                      notes={notes}
                      noteTitle={noteTitle}
                      noteContent={noteContent}
                      onTitleChange={setNoteTitle}
                      onContentChange={setNoteContent}
                      onAddNote={handleAddNote}
                    />

                    {communicationLoading && (
                      <div className="rounded-2xl border border-gold/20 bg-white p-4 text-sm text-slate shadow-sm">
                        Loading communication log...
                      </div>
                    )}

                    {communicationError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <span>{communicationError}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (!weddingId) return;
                              void (async () => {
                                setCommunication([]);
                                setCommunicationLoading(true);
                                setCommunicationError(null);
                                try {
                                  const nextEntries = await db.getCommunicationLogsForWedding(weddingId);
                                  setCommunication(nextEntries);
                                } catch (err) {
                                  setCommunication([]);
                                  setCommunicationError('We could not load the communication log for this wedding right now. Please try again.');
                                } finally {
                                  setCommunicationLoading(false);
                                }
                              })();
                            }}
                            className="text-red-700 underline font-medium"
                          >
                            Retry
                          </button>
                        </div>
                      </div>
                    )}

                    {communicationSaving && (
                      <div className="rounded-2xl border border-gold/20 bg-white p-3 text-sm text-slate shadow-sm">
                        Saving communication...
                      </div>
                    )}

                    <CommunicationLogSection
                      communication={communication}
                      commType={commType}
                      commSummary={commSummary}
                      commDate={commDate}
                      commFollowUp={commFollowUp}
                      onTypeChange={setCommType}
                      onSummaryChange={setCommSummary}
                      onDateChange={setCommDate}
                      onFollowUpChange={setCommFollowUp}
                      onAddCommunication={handleAddCommunication}
                    />

                    {vendorsLoading && (
                      <div className="rounded-2xl border border-gold/20 bg-white p-4 text-sm text-slate shadow-sm">
                        Loading vendors...
                      </div>
                    )}

                    {vendorsError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <span>{vendorsError}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (!weddingId) return;
                              void (async () => {
                                setVendors([]);
                                setVendorsLoading(true);
                                setVendorsError(null);
                                try {
                                  const nextVendors = await db.getVendorsForWedding(weddingId);
                                  setVendors(nextVendors);
                                } catch (err) {
                                  setVendors([]);
                                  setVendorsError('We could not load vendors for this wedding right now. Please try again.');
                                } finally {
                                  setVendorsLoading(false);
                                }
                              })();
                            }}
                            className="text-red-700 underline font-medium"
                          >
                            Retry
                          </button>
                        </div>
                      </div>
                    )}

                    {vendorSaving && (
                      <div className="rounded-2xl border border-gold/20 bg-white p-3 text-sm text-slate shadow-sm">
                        Saving vendor...
                      </div>
                    )}

                    <VendorTrackingSection
                      vendors={vendors}
                      vendorName={vendorName}
                      vendorCategory={vendorCategory}
                      vendorStatus={vendorStatus}
                      vendorNote={vendorNote}
                      onNameChange={setVendorName}
                      onCategoryChange={setVendorCategory}
                      onStatusChange={setVendorStatus}
                      onNoteChange={setVendorNote}
                      onAddVendor={handleAddVendor}
                    />
                  </>
                )}
              </div>

              <div className="space-y-6 sm:space-y-7 lg:space-y-8">
                {visionNotesLoading && (
                  <div className="rounded-2xl border border-gold/20 bg-white p-4 text-sm text-slate shadow-sm">
                    Loading vision notes...
                  </div>
                )}

                {visionNotesError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span>{visionNotesError}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!weddingId) return;
                          void (async () => {
                            setVisionNotes([]);
                            setVisionNotesLoading(true);
                            setVisionNotesError(null);
                            try {
                              const nextVisionNotes = await db.getVisionNotesForWedding(weddingId);
                              setVisionNotes(nextVisionNotes);
                            } catch (err) {
                              setVisionNotes([]);
                              setVisionNotesError('We could not load vision notes for this wedding right now. Please try again.');
                            } finally {
                              setVisionNotesLoading(false);
                            }
                          })();
                        }}
                        className="text-red-700 underline font-medium"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}

                {visionSaving && (
                  <div className="rounded-2xl border border-gold/20 bg-white p-3 text-sm text-slate shadow-sm">
                    Saving vision note...
                  </div>
                )}

                <VisionNotesSection
                  visionNotes={visionNotes}
                  visionTitle={visionTitle}
                  visionCategory={visionCategory}
                  visionDescription={visionDescription}
                  onTitleChange={setVisionTitle}
                  onCategoryChange={setVisionCategory}
                  onDescriptionChange={setVisionDescription}
                  onAddVisionNote={handleAddVisionNote}
                />

                {paymentsLoading && (
                  <div className="rounded-2xl border border-gold/20 bg-white p-4 text-sm text-slate shadow-sm">
                    Loading payments...
                  </div>
                )}

                {paymentsError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span>{paymentsError}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!weddingId) return;
                          void (async () => {
                            setPayments([]);
                            setPaymentsLoading(true);
                            setPaymentsError(null);
                            try {
                              const nextPayments = await db.getPaymentsForWedding(weddingId);
                              setPayments(nextPayments);
                            } catch (err) {
                              setPayments([]);
                              setPaymentsError('We could not load payment tracking for this wedding right now. Please try again.');
                            } finally {
                              setPaymentsLoading(false);
                            }
                          })();
                        }}
                        className="text-red-700 underline font-medium"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}

                {paymentSaving && (
                  <div className="rounded-2xl border border-gold/20 bg-white p-3 text-sm text-slate shadow-sm">
                    Saving payment...
                  </div>
                )}

                <PaymentTrackingSection
                  payments={payments}
                  paymentTitle={paymentTitle}
                  paymentAmount={paymentAmount}
                  paymentStatus={paymentStatus}
                  paymentDueDate={paymentDueDate}
                  paymentNote={paymentNote}
                  onTitleChange={setPaymentTitle}
                  onAmountChange={setPaymentAmount}
                  onStatusChange={setPaymentStatus}
                  onDueDateChange={setPaymentDueDate}
                  onNoteChange={setPaymentNote}
                  onAddPayment={handleAddPayment}
                />

                {milestonesLoading && (
                  <div className="rounded-2xl border border-gold/20 bg-white p-4 text-sm text-slate shadow-sm">
                    Loading milestones...
                  </div>
                )}

                {milestonesError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span>{milestonesError}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!weddingId) return;
                          void (async () => {
                            setMilestones([]);
                            setMilestonesLoading(true);
                            setMilestonesError(null);
                            try {
                              const nextMilestones = await db.getMilestonesForWedding(weddingId);
                              setMilestones(nextMilestones);
                            } catch (err) {
                              setMilestones([]);
                              setMilestonesError('We could not load milestones for this wedding right now. Please try again.');
                            } finally {
                              setMilestonesLoading(false);
                            }
                          })();
                        }}
                        className="text-red-700 underline font-medium"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}

                {milestoneSaving && (
                  <div className="rounded-2xl border border-gold/20 bg-white p-3 text-sm text-slate shadow-sm">
                    Saving milestone...
                  </div>
                )}

                <MilestonesSection
                  milestones={milestones}
                  milestoneTitle={milestoneTitle}
                  milestoneDueDate={milestoneDueDate}
                  milestoneStatus={milestoneStatus}
                  milestoneNote={milestoneNote}
                  onTitleChange={setMilestoneTitle}
                  onDueDateChange={setMilestoneDueDate}
                  onStatusChange={setMilestoneStatus}
                  onNoteChange={setMilestoneNote}
                  onAddMilestone={handleAddMilestone}
                />

                <MoodBoardPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};