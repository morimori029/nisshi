import ReportClient from '@/components/report/ReportClient';

interface Props {
    params: Promise<{ date: string }>;
}

export default async function ReportPage({ params }: Props) {
    const { date } = await params;
    return <ReportClient date={date} />;
}
