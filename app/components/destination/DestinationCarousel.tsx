import CustomCarousel from "../generic_components/CustomCarousel";
import { useRouter } from "next/router";
// import { Destination } from "@/libs/services/business/destination";
import { Experience } from "@/libs/services/business/experience";
import { Content } from "@/app/components/generic_components/CustomCarousel";

interface DestinationCarouselProps {
    destinations: Experience[] | undefined;
    header?: string;
    filter_mode?: "active" | "all"
}

const DestinationCarousel:React.FC<DestinationCarouselProps> = ({
    destinations,
    header="Featured Destinations",
    filter_mode="all"
}) => {
    const router = useRouter();
    const handleContinue = (destinationId: string) => {
        router.push(`/destination/${destinationId}`);
    };

    const transformDestinations = (destinations: Experience[] | undefined, filter_mode?: string): Content[] => {
        if (destinations){
            return destinations
                .filter(
                    destination => 
                        filter_mode === "active" 
                        ? destination.status === "active" 
                        : true
                )
                .map(({ primary_photo, id, name }) => ({
                    id,
                    name,
                    image: primary_photo,
                }));
        }
        return ([{
            id: "",
            name: "",
            image: "",
        }])
    };

    return (
        <CustomCarousel
            contents={transformDestinations(destinations, filter_mode)}
            header={header}
            onCardSelect={(id)=> handleContinue(id)}
            onViewAll={()=> router.push("/destination/select")}
        />
    )
}

export default DestinationCarousel;