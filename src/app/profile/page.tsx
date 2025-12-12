"use client";

import { PatientFile } from "@/components/PatientFile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 md:p-12 notebook-bg">
            <Card className="w-full max-w-4xl bg-amber-50/90 text-slate-800 border-amber-200 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-amber-200 pb-4">
                    <div>
                        <CardTitle className="font-headline text-3xl text-slate-700">
                            Patient File
                        </CardTitle>
                        <CardDescription className="text-slate-600">A summary of your recent activity.</CardDescription>
                    </div>
                    <Button asChild variant="ghost" className="text-slate-600 hover:bg-slate-400/20">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Journal
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="pt-6">
                    <PatientFile />
                </CardContent>
            </Card>
        </main>
    )
}
