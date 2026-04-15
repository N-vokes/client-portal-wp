import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockClients } from '../data/mockClients';
import type { Note, CommunicationEntry, VendorEntry, PaymentEntry, VisionNote, MilestoneEntry } from '../types/clientProfile';
import { initialNotes, initialCommunication, initialVendors, initialPayments, initialVisionNotes, initialMilestones } from '../data/clientProfileData';
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

interface ClientProfileProps {
  userRole: 'planner' | 'couple';
}

export const ClientProfile: React.FC<ClientProfileProps> = ({ userRole }) => {
  const { id } = useParams<{ id: string }>();

  const client = useMemo(() => {
    if (!id) return undefined;
    const numericId = Number(id);
    return mockClients.find((item) => item.id === numericId);
  }, [id]);

  const [notesByClient, setNotesByClient] = useState<Record<number, Note[]>>(initialNotes);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [commByClient, setCommByClient] = useState<Record<number, CommunicationEntry[]>>(initialCommunication);
  const [commType, setCommType] = useState('');
  const [commSummary, setCommSummary] = useState('');
  const [commDate, setCommDate] = useState('');
  const [commFollowUp, setCommFollowUp] = useState('');

  const [vendorsByClient, setVendorsByClient] = useState<Record<number, VendorEntry[]>>(initialVendors);
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('');
  const [vendorStatus, setVendorStatus] = useState<'pending' | 'contacted' | 'booked'>('pending');
  const [vendorNote, setVendorNote] = useState('');

  const [visionByClient, setVisionByClient] = useState<Record<number, VisionNote[]>>(initialVisionNotes);
  const [visionTitle, setVisionTitle] = useState('');
  const [visionDescription, setVisionDescription] = useState('');
  const [visionCategory, setVisionCategory] = useState('');

  const [milestonesByClient, setMilestonesByClient] = useState<Record<number, MilestoneEntry[]>>(initialMilestones);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [milestoneStatus, setMilestoneStatus] = useState<'upcoming' | 'in progress' | 'completed'>('upcoming');
  const [milestoneNote, setMilestoneNote] = useState('');

  const [paymentsByClient, setPaymentsByClient] = useState<Record<number, PaymentEntry[]>>(initialPayments);
  const [paymentTitle, setPaymentTitle] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'unpaid'>('unpaid');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const [intakeCoupleNames, setIntakeCoupleNames] = useState(client?.coupleNames || '');
  const [intakeWeddingDate, setIntakeWeddingDate] = useState(client?.weddingDate || '');
  const [intakeCeremonyVenue, setIntakeCeremonyVenue] = useState(client?.location || '');
  const [intakeReceptionVenue, setIntakeReceptionVenue] = useState('');
  const [intakeGuestCount, setIntakeGuestCount] = useState('');
  const [intakeBudget, setIntakeBudget] = useState('');
  const [intakePlanningStage, setIntakePlanningStage] = useState('');
  const [intakeWeddingStyle, setIntakeWeddingStyle] = useState('');
  const [intakePreferredColors, setIntakePreferredColors] = useState('');
  const [intakeTopPriorities, setIntakeTopPriorities] = useState('');
  const [intakeMustHaves, setIntakeMustHaves] = useState('');
  const [intakeDoNotWant, setIntakeDoNotWant] = useState('');
  const [intakeMainHelpNeeded, setIntakeMainHelpNeeded] = useState('');
  const [intakeBiggestConcern, setIntakeBiggestConcern] = useState('');
  const [intakeCommunicationPreference, setIntakeCommunicationPreference] = useState('');
  const [intakeAdditionalNotes, setIntakeAdditionalNotes] = useState('');

  const notes = client ? notesByClient[client.id] || [] : [];
  const communication = client ? commByClient[client.id] || [] : [];
  const vendors = client ? vendorsByClient[client.id] || [] : [];
  const payments = client ? paymentsByClient[client.id] || [] : [];
  const milestones = client ? milestonesByClient[client.id] || [] : [];
  const visionNotes = client ? visionByClient[client.id] || [] : [];

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

  const nextAction = (() => {
    const upcoming = payments.find((payment) => {
      if (payment.status === 'paid') return false;
      const due = new Date(payment.dueDate);
      const now = new Date();
      const inSeven = new Date();
      inSeven.setDate(now.getDate() + 7);
      return due >= now && due <= inSeven;
    });

    if (upcoming) {
      return 'Payment due this week';
    }

    const contactedVendor = vendors.find((vendor) => vendor.status === 'contacted');
    if (contactedVendor) {
      return `Follow up with ${contactedVendor.category} quote`;
    }

    const pendingVendor = vendors.find((vendor) => vendor.status === 'pending');
    if (pendingVendor) {
      return `Follow up with ${pendingVendor.category} vendor`;
    }

    if (payments.some((p) => p.status === 'partial')) {
      return 'Finalize partial payments';
    }

    return 'Review progress with couple';
  })();

  const reminders = (() => {
    const items: string[] = [];

    if (vendors.some((vendor) => vendor.status === 'pending')) {
      items.push('Follow up on pending vendor');
    }

    const soonDue = payments.some((payment) => {
      if (payment.status === 'paid') return false;
      const due = new Date(payment.dueDate);
      const now = new Date();
      const inSeven = new Date();
      inSeven.setDate(now.getDate() + 7);
      return due >= now && due <= inSeven;
    });

    if (soonDue) {
      items.push('Payment due soon');
    }

    if (milestones.some((milestone) => milestone.status === 'in progress')) {
      items.push('Milestone still in progress');
    }

    if (items.length === 0) {
      items.push('All clear — keep momentum with your next action.');
    }

    return items;
  })();

  const handleAddNote = () => {
    if (!client || !noteTitle.trim() || !noteContent.trim()) return;
    const nextNotes = notesByClient[client.id] || [];
    const newNote: Note = {
      id: nextNotes.length > 0 ? nextNotes[nextNotes.length - 1].id + 1 : 1,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      createdAt: new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    setNotesByClient((prev) => ({
      ...prev,
      [client.id]: [...nextNotes, newNote],
    }));
    setNoteTitle('');
    setNoteContent('');
  };

  const handleAddCommunication = () => {
    if (!client || !commType.trim() || !commSummary.trim() || !commDate.trim()) return;
    const nextCommunication = commByClient[client.id] || [];
    const newEntry: CommunicationEntry = {
      id: nextCommunication.length > 0 ? nextCommunication[nextCommunication.length - 1].id + 1 : 1,
      type: commType.trim(),
      summary: commSummary.trim(),
      date: commDate,
      followUp: commFollowUp.trim() || undefined,
    };

    setCommByClient((prev) => ({
      ...prev,
      [client.id]: [...nextCommunication, newEntry],
    }));
    setCommType('');
    setCommSummary('');
    setCommDate('');
    setCommFollowUp('');
  };

  const handleAddVendor = () => {
    if (!client || !vendorName.trim() || !vendorCategory.trim()) return;
    const nextVendors = vendorsByClient[client.id] || [];
    const newVendor: VendorEntry = {
      id: nextVendors.length > 0 ? nextVendors[nextVendors.length - 1].id + 1 : 1,
      vendorName: vendorName.trim(),
      category: vendorCategory.trim(),
      status: vendorStatus,
      note: vendorNote.trim() || undefined,
    };

    setVendorsByClient((prev) => ({
      ...prev,
      [client.id]: [...nextVendors, newVendor],
    }));
    setVendorName('');
    setVendorCategory('');
    setVendorStatus('pending');
    setVendorNote('');
  };

  const handleAddPayment = () => {
    if (!client || !paymentTitle.trim() || !paymentAmount.trim() || !paymentDueDate.trim()) return;
    const nextPayments = paymentsByClient[client.id] || [];
    const newPayment: PaymentEntry = {
      id: nextPayments.length > 0 ? nextPayments[nextPayments.length - 1].id + 1 : 1,
      title: paymentTitle.trim(),
      amount: Number(paymentAmount),
      status: paymentStatus,
      dueDate: paymentDueDate,
      note: paymentNote.trim() || undefined,
    };

    setPaymentsByClient((prev) => ({
      ...prev,
      [client.id]: [...nextPayments, newPayment],
    }));
    setPaymentTitle('');
    setPaymentAmount('');
    setPaymentStatus('unpaid');
    setPaymentDueDate('');
    setPaymentNote('');
  };

  const handleAddMilestone = () => {
    if (!client || !milestoneTitle.trim() || !milestoneDueDate.trim()) return;
    const nextMilestones = milestonesByClient[client.id] || [];
    const newMilestone: MilestoneEntry = {
      id: nextMilestones.length > 0 ? nextMilestones[nextMilestones.length - 1].id + 1 : 1,
      title: milestoneTitle.trim(),
      dueDate: milestoneDueDate,
      status: milestoneStatus,
      note: milestoneNote.trim() || undefined,
    };

    setMilestonesByClient((prev) => ({
      ...prev,
      [client.id]: [...nextMilestones, newMilestone],
    }));
    setMilestoneTitle('');
    setMilestoneDueDate('');
    setMilestoneStatus('upcoming');
    setMilestoneNote('');
  };

  const handleAddVisionNote = () => {
    if (!client || !visionTitle.trim() || !visionDescription.trim()) return;
    const nextVision = visionByClient[client.id] || [];
    const newVision: VisionNote = {
      id: nextVision.length > 0 ? nextVision[nextVision.length - 1].id + 1 : 1,
      title: visionTitle.trim(),
      description: visionDescription.trim(),
      category: visionCategory.trim() || undefined,
    };

    setVisionByClient((prev) => ({
      ...prev,
      [client.id]: [...nextVision, newVision],
    }));
    setVisionTitle('');
    setVisionDescription('');
    setVisionCategory('');
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-cream page-enter flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gold/20 p-6 sm:p-8 lg:p-12 text-center max-w-lg mx-4">
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal mb-3 sm:mb-4">Client not found</h1>
<p className="text-sm sm:text-base text-slate mb-5 sm:mb-6">The requested client profile was not found. Please select a valid client from the list.</p>
          <Link to="/clients" className="btn-primary inline-block w-full sm:w-auto">Back to Clients</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream page-enter">
      <ClientHeader
        coupleNames={client.coupleNames}
        weddingDate={client.weddingDate}
        location={client.location}
        progress={client.progress}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
  <div className="space-y-5 sm:space-y-8">
    {userRole === 'planner' && (
      <QuickActionsReminders reminders={reminders} />
    )}

    <div className="bg-white rounded-2xl border border-gold/20 p-4 sm:p-6 lg:p-7 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div>
              <h2 className="text-xl font-serif text-charcoal mb-3">Wedding Date</h2>
              <p className="text-slate text-base sm:text-lg font-medium">{new Date(client.weddingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif text-charcoal mb-2 sm:mb-3">Location</h2>
              <p className="text-slate text-base sm:text-lg font-medium break-words">{client.location}</p>
            </div>
          </div>

          <div className="mt-5 sm:mt-8 border-t border-gold/20 pt-4 sm:pt-6">
            <h2 className="text-xl sm:text-2xl font-serif text-charcoal mb-2 sm:mb-3">Planning Progress</h2>

<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
  <span className="text-sm text-slate">{client.progress}% complete</span>
  <span className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal bg-sand px-3 py-1 rounded-full w-fit">
    <span className="w-2 h-2 rounded-full bg-gold" />
    {client.progress > 80 ? 'Excellent' : client.progress > 50 ? 'Steady' : 'At risk'}
  </span>
</div>

<div className="w-full bg-sand rounded-full h-3 overflow-hidden shadow-inner">
              <div className="bg-gold h-3 rounded-full transition-all" style={{ width: `${client.progress}%` }} />
            </div>
            </div>
          </div>
        </div>

        <ClientOverviewCards
          totalVendors={totalVendors}
          bookedVendors={bookedVendors}
          paymentsDue={paymentsDue}
          paymentsPaid={paymentsPaid}
          vendorReadiness={vendorReadiness}
          paymentReadiness={paymentReadiness}
          milestoneCompletion={milestoneCompletion}
          overallReadiness={overallReadiness}
          overallStatus={overallStatus}
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
    <>
      <NotesSection
        notes={notes}
        noteTitle={noteTitle}
        noteContent={noteContent}
        onTitleChange={setNoteTitle}
        onContentChange={setNoteContent}
        onAddNote={handleAddNote}
      />

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
  );
};