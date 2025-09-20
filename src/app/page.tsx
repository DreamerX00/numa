import { fetchFeaturedProducts, fetchCollections } from "../lib/services/catalog";
import { AnimatedHomePage } from "@/components/pages/AnimatedHomePage";

async function getHomeData() {
  const [featured, collections] = await Promise.all([
    fetchFeaturedProducts(),
    fetchCollections()
  ]);
  return { featured, collections };
}

export default async function HomePage() {
  const { featured, collections } = await getHomeData();
  
  return <AnimatedHomePage featured={featured} collections={collections} />;
}
