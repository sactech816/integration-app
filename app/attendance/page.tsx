import { redirect } from 'next/navigation';

// /attendance にアクセスした場合は /attendance/new へリダイレクト
export default function AttendancePage() {
  redirect('/attendance/new');
}
