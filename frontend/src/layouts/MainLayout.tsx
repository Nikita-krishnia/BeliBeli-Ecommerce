import SaleBanner from "../components/SaleBanner.jsx";
import Categories from "../components/Categories.tsx";
import FlashSale from "../components/FlashSale.tsx";
import TodaysForYou from "../components/TodaysForYou.tsx";
import { useSearchParams } from "react-router-dom";

interface MainLayoutProps {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
}

export default function MainLayout({ selectedCategory, setSelectedCategory }: MainLayoutProps) {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    return (
        <div>
            {searchQuery === "" && selectedCategory === 'all' && <SaleBanner />}
            <main>
                <Categories onSelectCategory={setSelectedCategory} />
                
                {searchQuery === "" && selectedCategory === 'all' && <FlashSale />}                
                
                <TodaysForYou 
                    selectedCategory={selectedCategory} 
                    searchQuery={searchQuery} 
                />
            </main>
        </div>
    );
}