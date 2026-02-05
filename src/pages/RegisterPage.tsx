import { FormEvent, useState } from 'react';
import PageShell from '../components/PageShell';
import { supabase } from '../lib/supabase';
import type { AcademicStatus, TargetExam } from '../lib/types';

type FormData = {
  fullName: string;
  email: string;
  studentMobile: string;
  parentMobile: string;
  academicStatus: AcademicStatus;
  targetExam: TargetExam;
  referralCode: string;
  acceptedPolicy: boolean;
};

const initialFormData: FormData = {
  fullName: '',
  email: '',
  studentMobile: '',
  parentMobile: '',
  academicStatus: 'School (Class 9–10)',
  targetExam: 'NEET 2026',
  referralCode: '',
  acceptedPolicy: false,
};

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const setField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.acceptedPolicy) {
      setError('Please accept the policy confirmation checkbox before submitting.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      let matchedAffiliateId: string | null = null;
      let referralCodeToSave: string | null = null;
      const referralInput = formData.referralCode.trim().toUpperCase();

      if (referralInput) {
        const { data: affiliate } = await supabase
          .from('affiliates')
          .select('id, referral_code')
          .eq('referral_code', referralInput)
          .eq('is_active', true)
          .maybeSingle();

        // Silent validation by design: invalid codes are ignored without user-facing errors.
        if (affiliate) {
          matchedAffiliateId = affiliate.id;
          referralCodeToSave = affiliate.referral_code;
        }
      }

      const { data: student, error: insertError } = await supabase
        .from('student_registrations')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          student_mobile: formData.studentMobile,
          parent_mobile: formData.parentMobile,
          academic_status: formData.academicStatus,
          target_exam: formData.targetExam,
          referral_code: referralCodeToSave,
        })
        .select('id')
        .single();

      if (insertError || !student) {
        throw insertError ?? new Error('Registration failed.');
      }

      if (matchedAffiliateId) {
        await supabase.from('affiliate_referrals').insert({
          affiliate_id: matchedAffiliateId,
          student_id: student.id,
          payout_status: 'pending',
        });
      }

      setIsSubmitted(true);
      setFormData(initialFormData);
    } catch {
      setError('Unable to submit registration right now. Please try again shortly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell
      title="Physics Notebook — Student Registration"
      subtitle="Complete this form to submit your registration request."
    >
      {isSubmitted ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Registration received. You will be contacted for confirmation.
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Full Name *</span>
          <input
            required
            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            value={formData.fullName}
            onChange={(event) => setField('fullName', event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Email ID *</span>
          <input
            required
            type="email"
            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            value={formData.email}
            onChange={(event) => setField('email', event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Student Mobile Number *</span>
          <input
            required
            type="tel"
            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            value={formData.studentMobile}
            onChange={(event) => setField('studentMobile', event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Parent&apos;s Mobile Number *</span>
          <input
            required
            type="tel"
            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            value={formData.parentMobile}
            onChange={(event) => setField('parentMobile', event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Current Academic Status *</span>
          <select
            required
            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            value={formData.academicStatus}
            onChange={(event) => setField('academicStatus', event.target.value as AcademicStatus)}
          >
            <option>School (Class 9–10)</option>
            <option>Class 11</option>
            <option>Class 12</option>
            <option>Repeater</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Target Exam *</span>
          <select
            required
            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            value={formData.targetExam}
            onChange={(event) => setField('targetExam', event.target.value as TargetExam)}
          >
            <option>NEET 2026</option>
            <option>NEET 2027 &amp; beyond</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Referral Code (optional)</span>
          <input
            className="w-full rounded-md border border-slate-300 p-2 text-sm uppercase focus:border-blue-500 focus:outline-none"
            value={formData.referralCode}
            onChange={(event) => setField('referralCode', event.target.value)}
          />
        </label>

        <label className="flex items-start gap-2 rounded-md border border-slate-200 p-3 text-sm">
          <input
            required
            type="checkbox"
            checked={formData.acceptedPolicy}
            onChange={(event) => setField('acceptedPolicy', event.target.checked)}
            className="mt-0.5"
          />
          <span>I have read and understood the program details and refund policy.</span>
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </PageShell>
  );
}
