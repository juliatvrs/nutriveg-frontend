import { Card, CardBody, HStack, Image, Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import veganTag from "../../assets/img/vegan-tag.svg";
import vegetarianTag from "../../assets/img/vegetarian-tag.svg";

function BestRatedRecipeCard({ bestRatedRecipe }) {
    return(
        <>
            <Link to={`/receitas/${bestRatedRecipe?.id}`} >
                <Card
                    borderRadius="10px"
                    border="1px"
                    borderColor="#D9D9D9"
                    variant="outline"
                    height="290px"
                    width="100%" //para que o card ocupe 100% de largura do seu respectivo componente pai
                >
                    <CardBody padding="0" >
                        <Image
                            src={bestRatedRecipe?.image}
                            alt={bestRatedRecipe?.title}
                            borderRadius="8px"
                            height="150px"
                            width="100%"
                            objectFit="cover" //para a imagem se ajustar sem ficar distorcida
                        />
                            <Stack
                                marginTop="12px"
                                spacing="11px"
                                paddingLeft="15px"
                                paddingRight="15px"
                            >
                                <HStack>
                                    {bestRatedRecipe?.typeOfDiet === "vegano" ? (
                                        <>
                                            <Image 
                                                src={veganTag}
                                                width="20px"
                                                height="20px"
                                            />
                                            <Text
                                                fontSize="12px" 
                                                fontWeight="light" 
                                                color="#219653"
                                            >
                                                Vegano
                                            </Text>
                                        </>
                                    ) : bestRatedRecipe?.typeOfDiet === "vegetariano" && (
                                        <>
                                            <Image 
                                                src={vegetarianTag}
                                                width="20px"
                                                height="20px"
                                            />
                                            <Text
                                                fontSize="12px" 
                                                fontWeight="light" 
                                                color="#F2994A"
                                            >
                                                Vegetariano
                                            </Text>
                                        </>
                                    )} 
                                </HStack>
                                
                                <Text 
                                    fontWeight="medium"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3, 
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                > 
                                    {bestRatedRecipe?.title}
                                </Text>
                            </Stack>
                    </CardBody>
                </Card>
            </Link>
        </>
    );
};

export default BestRatedRecipeCard;