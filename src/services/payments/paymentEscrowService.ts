// GigEasy Payment & Escrow Service
// Handles escrow custody, Razorpay/UPI integration, platform commissions, and worker payouts

export type PaymentStatus =
  | 'PENDING'
  | 'HELD_IN_ESCROW'
  | 'RELEASED_TO_WORKER'
  | 'REFUNDED'
  | 'DISPUTED';

export interface EscrowTransaction {
  id: string;
  jobId: string;
  employerId: string;
  workerId: string;
  agreedDailyWage: number;
  platformFee: number; // 5% platform fee
  tdsDeduction: number; // 1% TDS under Section 194C/194M if applicable
  netWorkerPayout: number;
  status: PaymentStatus;
  paymentGatewayRef: string; // Razorpay order / UPI UTR
  fundedAt: string;
  releasedAt?: string;
}

export const PLATFORM_FEE_PERCENT = 5;
export const TDS_PERCENT = 1;

/**
 * Calculates payment split for a gig
 */
export function calculatePaymentBreakdown(wage: number) {
  const platformFee = Math.round((wage * PLATFORM_FEE_PERCENT) / 100);
  const tdsDeduction = Math.round((wage * TDS_PERCENT) / 100);
  const netWorkerPayout = wage - tdsDeduction;
  const totalEmployerBilled = wage + platformFee;

  return {
    baseWage: wage,
    platformFee,
    tdsDeduction,
    netWorkerPayout,
    totalEmployerBilled,
  };
}

/**
 * Escrow State Machine Helper
 */
export class PaymentEscrowService {
  private transactions: Map<string, EscrowTransaction> = new Map();

  createEscrowDeposit(params: {
    jobId: string;
    employerId: string;
    workerId: string;
    agreedDailyWage: number;
  }): EscrowTransaction {
    const split = calculatePaymentBreakdown(params.agreedDailyWage);
    const tx: EscrowTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      jobId: params.jobId,
      employerId: params.employerId,
      workerId: params.workerId,
      agreedDailyWage: params.agreedDailyWage,
      platformFee: split.platformFee,
      tdsDeduction: split.tdsDeduction,
      netWorkerPayout: split.netWorkerPayout,
      status: 'HELD_IN_ESCROW',
      paymentGatewayRef: `pay_rzp_${Date.now()}`,
      fundedAt: new Date().toISOString(),
    };

    this.transactions.set(tx.id, tx);
    return tx;
  }

  releaseToWorker(txId: string): EscrowTransaction | null {
    const tx = this.transactions.get(txId);
    if (!tx || tx.status !== 'HELD_IN_ESCROW') return null;

    tx.status = 'RELEASED_TO_WORKER';
    tx.releasedAt = new Date().toISOString();
    return tx;
  }

  refundEmployer(txId: string): EscrowTransaction | null {
    const tx = this.transactions.get(txId);
    if (!tx || tx.status !== 'HELD_IN_ESCROW') return null;

    tx.status = 'REFUNDED';
    return tx;
  }
}

export const paymentEscrowService = new PaymentEscrowService();
