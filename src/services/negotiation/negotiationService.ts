// GigEasy Wage Negotiation Engine
// Manages auditable counter-offer transactions and consensus agreements

export interface NegotiationTurn {
  id: string;
  round: number;
  senderRole: 'worker' | 'employer';
  proposedWage: number;
  message?: string;
  timestamp: string;
}

export interface NegotiationSession {
  id: string;
  applicationId: string;
  jobId: string;
  workerId: string;
  employerId: string;
  initialJobMaxWage: number;
  initialWorkerWage: number;
  currentWage: number;
  status: 'NEGOTIATING' | 'AGREED' | 'DECLINED' | 'EXPIRED';
  turns: NegotiationTurn[];
  agreedWage?: number;
  updatedAt: string;
}

export class NegotiationService {
  private sessions: Map<string, NegotiationSession> = new Map();

  createSession(params: {
    applicationId: string;
    jobId: string;
    workerId: string;
    employerId: string;
    initialJobMaxWage: number;
    workerProposedWage: number;
  }): NegotiationSession {
    const session: NegotiationSession = {
      id: `neg_${Date.now()}`,
      applicationId: params.applicationId,
      jobId: params.jobId,
      workerId: params.workerId,
      employerId: params.employerId,
      initialJobMaxWage: params.initialJobMaxWage,
      initialWorkerWage: params.workerProposedWage,
      currentWage: params.workerProposedWage,
      status: 'NEGOTIATING',
      turns: [
        {
          id: `turn_1`,
          round: 1,
          senderRole: 'worker',
          proposedWage: params.workerProposedWage,
          timestamp: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  submitCounterOffer(params: {
    sessionId: string;
    senderRole: 'worker' | 'employer';
    counterWage: number;
    message?: string;
  }): NegotiationSession | null {
    const session = this.sessions.get(params.sessionId);
    if (!session || session.status !== 'NEGOTIATING') return null;

    const newTurn: NegotiationTurn = {
      id: `turn_${session.turns.length + 1}`,
      round: session.turns.length + 1,
      senderRole: params.senderRole,
      proposedWage: params.counterWage,
      message: params.message,
      timestamp: new Date().toISOString(),
    };

    session.turns.push(newTurn);
    session.currentWage = params.counterWage;
    session.updatedAt = new Date().toISOString();
    return session;
  }

  acceptOffer(sessionId: string): NegotiationSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.status = 'AGREED';
    session.agreedWage = session.currentWage;
    session.updatedAt = new Date().toISOString();
    return session;
  }
}

export const negotiationService = new NegotiationService();
