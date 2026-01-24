import { redirect } from 'next/navigation';

export default function BookingDashboardPage() {
  redirect('/dashboard?view=booking');
}
