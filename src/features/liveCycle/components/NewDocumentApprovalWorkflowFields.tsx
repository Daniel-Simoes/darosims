import type { ApprovalWorkflowMode } from '../approvalWorkflowTypes';
import '../liveCycle.css';

interface NewDocumentApprovalWorkflowFieldsProps {
  disabled?: boolean;
  workflow: ApprovalWorkflowMode;
  onWorkflowChange: (value: ApprovalWorkflowMode) => void;
  meetingTitle: string;
  onMeetingTitleChange: (value: string) => void;
  meetingDescription: string;
  onMeetingDescriptionChange: (value: string) => void;
  meetingDate: string;
  onMeetingDateChange: (value: string) => void;
  meetingTime: string;
  onMeetingTimeChange: (value: string) => void;
  documentTitle: string;
}

export function NewDocumentApprovalWorkflowFields({
  disabled = false,
  workflow,
  onWorkflowChange,
  meetingTitle,
  onMeetingTitleChange,
  meetingDescription,
  onMeetingDescriptionChange,
  meetingDate,
  onMeetingDateChange,
  meetingTime,
  onMeetingTimeChange,
  documentTitle,
}: NewDocumentApprovalWorkflowFieldsProps) {
  return (
    <div className="live-cycle-section live-cycle-workflow-section">
      <p className="live-cycle-workflow-label">Approval workflow</p>
      <div className="live-cycle-workflow-options" role="radiogroup" aria-label="Approval workflow">
        <label className={`live-cycle-workflow-card${workflow === 'standard' ? ' active' : ''}`}>
          <input
            type="radio"
            name="approval-workflow"
            value="standard"
            checked={workflow === 'standard'}
            disabled={disabled}
            onChange={() => onWorkflowChange('standard')}
          />
          <span>
            <strong>Standard Approval</strong>
            <small>Submit for review, then approver acts asynchronously.</small>
          </span>
        </label>
        <label className={`live-cycle-workflow-card${workflow === 'live' ? ' active' : ''}`}>
          <input
            type="radio"
            name="approval-workflow"
            value="live"
            checked={workflow === 'live'}
            disabled={disabled}
            onChange={() => onWorkflowChange('live')}
          />
          <span>
            <strong>Live Approval</strong>
            <small>Schedule a Daros Live session with reviewer and approver.</small>
          </span>
        </label>
      </div>

      {workflow === 'live' ? (
        <div className="live-cycle-live-fields">
          <div className="live-cycle-field">
            <label htmlFor="live-meeting-title">Meeting title</label>
            <input
              id="live-meeting-title"
              className="nd-input"
              value={meetingTitle}
              onChange={(e) => onMeetingTitleChange(e.target.value)}
              placeholder={documentTitle || 'Live document review'}
              disabled={disabled}
              required
            />
          </div>
          <div className="live-cycle-field">
            <label htmlFor="live-meeting-description">Meeting description</label>
            <textarea
              id="live-meeting-description"
              className="nd-input live-cycle-textarea"
              rows={3}
              value={meetingDescription}
              onChange={(e) => onMeetingDescriptionChange(e.target.value)}
              placeholder="Agenda, scope, or notes for participants"
              disabled={disabled}
            />
          </div>
          <div className="live-cycle-field-row">
            <div className="live-cycle-field">
              <label htmlFor="live-meeting-date">Meeting date</label>
              <input
                id="live-meeting-date"
                className="nd-input"
                type="date"
                value={meetingDate}
                onChange={(e) => onMeetingDateChange(e.target.value)}
                disabled={disabled}
                required
              />
            </div>
            <div className="live-cycle-field">
              <label htmlFor="live-meeting-time">Meeting time</label>
              <input
                id="live-meeting-time"
                className="nd-input"
                type="time"
                value={meetingTime}
                onChange={(e) => onMeetingTimeChange(e.target.value)}
                disabled={disabled}
                required
              />
            </div>
          </div>
          <p className="live-cycle-associated-doc">
            Associated document: <strong>{documentTitle.trim() || '—'}</strong> (created on submit)
          </p>
        </div>
      ) : null}
    </div>
  );
}