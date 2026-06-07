import SaleBanner from "../components/SaleBanner.jsx";
import Categories from "../components/Categories.tsx";
import FlashSale from "../components/FlashSale.tsx";
import TodaysForYou from "../components/TodaysForYou.tsx";
import { useSearchParams } from "react-router-dom";
import { useEffect } from 'react';

interface MainLayoutProps {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
}

export default function MainLayout({ selectedCategory, setSelectedCategory }: MainLayoutProps) {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    const filterQuery = searchParams.get("filter") || "";

    useEffect(() => {
        if (filterQuery) {
            const targetSection = document.getElementById(filterQuery);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [filterQuery]);

    return (
        <div>
            {searchQuery === "" && selectedCategory === 'all' && <SaleBanner />}
            <main>
                <Categories onSelectCategory={setSelectedCategory} />
                
                {searchQuery === "" && selectedCategory === 'all' && (
                    <div id="flash_sale">
                        <FlashSale />
                    </div>
                )}               
                
                <div id="todays_for_you">
                    <TodaysForYou 
                        selectedCategory={selectedCategory} 
                        searchQuery={searchQuery} 
                    />
                </div>
            </main>
        </div>
    );
}