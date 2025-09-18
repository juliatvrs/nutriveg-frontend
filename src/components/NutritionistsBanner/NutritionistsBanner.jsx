import { Box, Text, Button } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import nutritionistsBannerImage from "../../assets/img/nutritionists-banner.jpg";
import { Link } from "react-router-dom";

function NutritionistsBanner() {
    return(
        <>
            <Box
                position="relative"
                display="flex"
                alignItems="center"
                height={{base: "250px", md: "350px", lg: "450px"}}
                marginTop="85px"
                marginBottom="85px" 
                marginLeft={{base: "34px", lg: "72px"}}
                marginRight={{base: "34px", lg: "72px"}}
                borderRadius="20px"
                backgroundImage={nutritionistsBannerImage}
                backgroundPosition="top"
                backgroundSize="cover"
            >
                <Box 
                    zIndex="1" 
                    width={{base: "175px", sm:"210px", md: "321px", lg: "440px"}}    
                    marginLeft={{base:"18px", md:"86px"}}  
                    marginTop={{base:"20px", md:"56px"}}  
                >
                    <Text
                        height={{base: "100px", md: "124px", lg: "144px"}}
                        color="#193C40"
                        fontWeight="light"
                        fontSize={{base: "14px", sm: "19px", md: "26px", lg: "34px"}}  
                    >
                        Conheça Nutricionistas especializados em alimentação vegana e vegetariana
                    </Text>
                    <Link to="/nutricionistas">
                        <Button
                            rightIcon={<ChevronRightIcon />}
                            background="#219653"
                            borderRadius="25px"
                            color="#FFFFFF"
                            fontWeight="medium"
                            width="132px"
                            height="40px"
                            marginTop={{base:"0px", sm:"22px", md:"50px", lg:"80px"}}
                        >
                            Conhecer
                        </Button>
                    </Link>
                </Box>
            </Box>
        </>
    );
};

export default NutritionistsBanner;