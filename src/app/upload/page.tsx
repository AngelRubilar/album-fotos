import { redirect } from "next/navigation";

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ album?: string }>;
}) {
  const { album } = await searchParams;
  redirect(album ? `/admin/upload?album=${encodeURIComponent(album)}` : "/admin/upload");
}
