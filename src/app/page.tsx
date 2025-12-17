import { DiaryBook } from '@/components/DiaryBook';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 md:p-12 notebook-bg">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-headline font-bold text-gray-200 tracking-wider">
          My Diary
        </h1>
        <p className="text-gray-400 mt-2">Your Personal Journal</p>
      </header>
      <DiaryBook />
    </main>
  );
}
