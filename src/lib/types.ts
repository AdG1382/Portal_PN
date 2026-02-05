export type AcademicStatus = 'School (Class 9–10)' | 'Class 11' | 'Class 12' | 'Repeater';

export type TargetExam = 'NEET 2026' | 'NEET 2027 & beyond';

export type AffiliateReferralRow = {
  id: string;
  payout_status: 'pending' | 'paid';
  student_registrations: {
    full_name: string;
    status: 'registered' | 'paid' | 'completed';
  } | null;
};

export type AffiliateProfile = {
  id: string;
  name: string;
  referral_code: string;
  email: string;
  is_active: boolean;
};
