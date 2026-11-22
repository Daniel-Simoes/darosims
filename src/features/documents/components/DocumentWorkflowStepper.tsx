import type { DocumentRecord } from '../../../types/documents';
import { isPendingDocumentApproval, isPendingDocumentReview } from '../../../lib/documents/documentApprovalWorkflow';

type StepState = 'complete' | 'current' | 'upcoming';

type WorkflowStep = {
  key: string;
  title: string;
  caption?: string;
  state: StepState;
};

export function buildDocumentWorkflowSteps(document: DocumentRecord): WorkflowStep[] | null {
  const submitted = Boolean(document.submittedAt);
  const reviewed = Boolean(document.reviewedAt);
  const pendingReview = isPendingDocumentReview(document);
  const pendingApproval = isPendingDocumentApproval(document);

  if (!pendingReview && !pendingApproval) return null;

  let reviewedCaption: string | undefined;
  if (pendingReview) reviewedCaption = 'Pending review';

  let approvedCaption: string | undefined;
  if (pendingApproval) approvedCaption = 'Pending approval';

  const reviewedState: StepState = reviewed ? 'complete' : submitted ? 'current' : 'upcoming';
  const approvedState: StepState = reviewed ? 'current' : 'upcoming';

  return [
    { key: 'created', title: 'Created', state: 'complete' },
    {
      key: 'reviewed',
      title: 'Reviewed',
      caption: reviewedCaption,
      state: reviewedState,
    },
    {
      key: 'approved',
      title: 'Approved',
      caption: approvedCaption,
      state: approvedState,
    },
  ];
}

function workflowProgressPercent(steps: WorkflowStep[]): number {
  const completed = steps.filter((s) => s.state === 'complete').length;
  const hasCurrent = steps.some((s) => s.state === 'current');
  if (completed >= 3) return 100;
  if (completed === 2 && !hasCurrent) return 100;
  if (completed === 2) return 78;
  if (completed === 1 && hasCurrent) return 38;
  return 12;
}

interface DocumentWorkflowStepperProps {
  document: DocumentRecord;
}

export function DocumentWorkflowStepper({ document }: DocumentWorkflowStepperProps) {
  const steps = buildDocumentWorkflowSteps(document);
  if (!steps) return null;

  const progress = workflowProgressPercent(steps);

  return (
    <div className="dd-workflow-stepper" role="list" aria-label="Document approval progress">
      <div className="dd-workflow-progress-track" aria-hidden="true">
        <div className="dd-workflow-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="dd-workflow-stepper-steps">
        {steps.map((step, index) => (
          <div
            key={step.key}
            role="listitem"
            className={`dd-workflow-step dd-workflow-step-${step.state}${
              index < steps.length - 1 ? ' dd-workflow-step-has-line' : ''
            }`}
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <span className="dd-workflow-step-dot" aria-hidden="true" />
            <span className="dd-workflow-step-title">{step.title}</span>
            {step.caption ? <span className="dd-workflow-step-caption">{step.caption}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}