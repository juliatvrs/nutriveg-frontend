import { Card, CardBody, Image, Text, Box, Button } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function RecipeCard({ recipe }) {

    const navigate = useNavigate();
    
    return(
        <>
            <Link to={`/receitas/${recipe.id}`}>
                <Card
                    width="100%" //para que o card ocupe 100% de largura do seu respectivo componente pai
                    height={{base:"457px", md:"437px"}} 
                    borderRadius="22px"
                    border="1px"
                    borderColor="#D9D9D9"
                    cursor="pointer"
                >
                    <CardBody padding="0">
                        <Image 
                            src={recipe.image}
                            alt={recipe.title}
                            borderRadius="20px"
                            width="100%"
                            height="230px"
                            objectFit="cover" //para a imagem se ajustar sem ficar distorcida
                        />

                        <Box
                            marginTop="19px"
                            marginLeft="18px"
                            marginRight="18px"
                        >
                            <Text 
                                fontWeight="bold" 
                                height={{base:"70px", md:"48px"}} 
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2, 
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {recipe.title}
                            </Text>
                            <Text 
                                marginTop={{base:"18px", md:"12px"}} 
                                fontWeight="light" 
                                height="50px"
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2, 
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {recipe.summary}
                            </Text>

                            <Button
                                marginTop="15px"
                                width="100px"
                                height="24px"
                                borderRadius="25px"
                                background="#219653"
                                fontSize="12px"
                                fontWeight="medium"
                                color="#FFFFFF"
                                lineHeight="16px"
                                rightIcon={<ChevronRightIcon boxSize="14px" />}
                                onClick={(event) => {
                                    event.preventDefault(); 
                                    navigate(`/receitas/${recipe.id}`);
                                }}
                            >
                                Leia mais
                            </Button>
                        </Box>
                    </CardBody>
                </Card>
            </Link>
        </>
    );
};

export default RecipeCard;