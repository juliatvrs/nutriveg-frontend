import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Box, Image, Text, useBreakpointValue } from "@chakra-ui/react";
import { Link } from "react-router-dom";

function NutritionistRecipesCarousel({ recipe }) {
    
    const itemsToShow = useBreakpointValue({ //quantidade de itens a serem mostrados com base no tamanho da tela
        base: 1,
        md: 2,
        lg: 3
    });

    const responsive = { //objeto do react-multi-carousel onde a responsividade é aplicada
        all: {
            breakpoint: { max: 4000, min: 0 },
            items: itemsToShow
        }
    };
    
    return(
        <>
            <Box
                width="100%"
                marginTop="34px"
            >
                <Carousel 
                    responsive={responsive}
                    autoPlay={true} //torna a rolagem do carrossel automática
                    autoPlaySpeed={3000}
                    infinite={true} //torna a rolagem do carrossel infinita
                    showDots={true}
                >
                    {recipe.map((item, index) => (
                        <Link to={`/receitas/${item.id}`} key={index}>
                            <Box padding={2}>
                                <Box
                                    position="relative"
                                    display="flex"
                                    alignItems="flex-end"
                                    justifyContent="left"
                                    width="100%"
                                    height="330px"
                                    marginBottom="34px"
                                    borderRadius="20px" 
                                >
                                    <Image 
                                        src={item.image}
                                        alt={item.title}
                                        objectFit="cover"
                                        width="100%"
                                        height="100%"
                                        borderRadius="20px"
                                    />
                                    <Box 
                                        position="absolute"
                                        bottom="0"
                                        left="0"
                                        right="0"
                                        zIndex="1"
                                        height="165px"
                                        background="linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))"
                                        borderBottomRadius="20px"
                                    />
                                    <Box zIndex="2" position="absolute" bottom="0" left="0" right="0">
                                        <Text
                                            fontSize={{base:"24px", md:"28px", lg:"30px"}}   
                                            fontWeight="bold"
                                            color="#FFFFFF"
                                            marginLeft="28px"
                                            marginRight="20px"
                                            marginBottom="20px"
                                            sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 1, 
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {item.title}
                                        </Text>
                                    </Box>
                                </Box>
                            </Box>
                        </Link>
                    ))}
                </Carousel>
            </Box>
        </>
    );
};

export default NutritionistRecipesCarousel;