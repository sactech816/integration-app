import { redirect } from 'next/navigation';

export default function BookingPage() {
  redirect('/dashboard?view=booking');
}
