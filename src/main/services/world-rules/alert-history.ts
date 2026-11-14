import { ALERT_HISTORY_MAX, type TriggeredAlertEvent } from '@shared/schemas/alerts.schema'

/**
 * In-memory history of triggered alerts for the current session only
 * (decision D3 of the CDC: wiped when TennoFrame quits, never written to disk).
 */
export class AlertHistory {
  private entries: TriggeredAlertEvent[] = []

  public push(event: TriggeredAlertEvent): void {
    this.entries = [event, ...this.entries].slice(0, ALERT_HISTORY_MAX)
  }

  public list(): TriggeredAlertEvent[] {
    return [...this.entries]
  }

  public clear(): void {
    this.entries = []
  }
}

