import { redirect } from 'next/navigation';

// /attendance/new は /attendance/editor にリダイレクト
export default function NewAttendancePage() {
  redirect('/attendance/editor');
}
